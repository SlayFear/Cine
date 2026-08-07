"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

interface Bloque {
  _id: string;
  nombre: string;
  direccion: string;
}

interface Serial {
  _id: string;
  codigo: string;
  status: "disponible" | "reservado" | "cancelado";
  seatId: string | null;
  guestName: string | null;
  guestEmail: string | null;
  checkedIn: boolean;
  exportedAt: string | null;
  bloqueId: Bloque | null;
}

interface Funcion {
  _id: string;
  orden: number;
  capacidad: number;
}

const STATUS_LABEL: Record<Serial["status"], string> = {
  disponible: "Disponible",
  reservado: "Reservado",
  cancelado: "Inactivo",
};

function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "bloque"
  );
}

export default function AdminSerialsPage() {
  const { funcionId } = useParams<{ funcionId: string }>();

  const [funcion, setFuncion] = useState<Funcion | null>(null);
  const [serials, setSerials] = useState<Serial[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [cantidad, setCantidad] = useState(5);
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const [funcionRes, serialsRes] = await Promise.all([
      fetch(`/api/admin/funciones/${funcionId}`).then((r) => r.json()),
      fetch(`/api/admin/funciones/${funcionId}/serials`).then((r) => r.json()),
    ]);
    setFuncion(funcionRes.funcion ?? null);
    setSerials(serialsRes.serials ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [funcionId]);

  const grupos = useMemo(() => {
    const map = new Map<string, { bloque: Bloque | null; serials: Serial[] }>();
    for (const s of serials) {
      const key = s.bloqueId?._id ?? "sin-bloque";
      if (!map.has(key)) map.set(key, { bloque: s.bloqueId, serials: [] });
      map.get(key)!.serials.push(s);
    }
    return Array.from(map.values());
  }, [serials]);

  const remaining = funcion ? funcion.capacidad - serials.length : 0;

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setMessage(null);

    const res = await fetch(`/api/admin/funciones/${funcionId}/serials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cantidad, nombre, direccion }),
    });
    const data = await res.json();
    setGenerating(false);

    if (!res.ok || !data.ok) {
      setMessage(data.error ?? "No se pudo generar");
      return;
    }

    const newIds: string[] = data.serials.map((s: Serial) => s._id);
    await load();
    setSelected(new Set(newIds));
    setMessage(`${newIds.length} seriales generados en el bloque "${nombre}"`);
    setNombre("");
    setDireccion("");
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleExport(ids: string[], filename: string) {
    if (ids.length === 0) return;
    setExporting(true);
    setMessage(null);

    const res = await fetch(`/api/admin/funciones/${funcionId}/serials/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serialIds: ids }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setMessage(data?.error ?? "No se pudo exportar el PDF");
      setExporting(false);
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    setExporting(false);
    await load();
  }

  async function handleInactivar(codigo: string) {
    if (!confirm(`¿Inactivar el serial ${codigo}? Ya no podra usarse.`)) return;

    const res = await fetch(`/api/admin/serials/${codigo}`, { method: "PATCH" });
    const data = await res.json();

    if (!res.ok || !data.ok) {
      setMessage(data.error ?? "No se pudo inactivar");
      return;
    }

    await load();
  }

  async function handleDelete(serial: Serial) {
    const warning =
      serial.status === "reservado"
        ? `¿Borrar definitivamente el serial ${serial.codigo}? Tiene un invitado registrado (${serial.guestName ?? "sin nombre"}, asiento ${serial.seatId ?? "-"}) que perdera su reservacion. Esta accion no se puede deshacer.`
        : `¿Borrar definitivamente el serial ${serial.codigo}? Esta accion no se puede deshacer.`;
    if (!confirm(warning)) return;

    const res = await fetch(`/api/admin/serials/${serial.codigo}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok || !data.ok) {
      setMessage(data.error ?? "No se pudo borrar");
      return;
    }

    await load();
  }

  async function handleAddToBloque(bloqueId: string | undefined, nombre: string) {
    if (!bloqueId) return;
    const input = prompt(`¿Cuantos seriales extra quieres agregar al bloque "${nombre}"?`, "5");
    if (!input) return;

    const cantidad = Number(input);
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      setMessage("Cantidad invalida");
      return;
    }

    setMessage(null);
    const res = await fetch(`/api/admin/bloques/${bloqueId}/serials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cantidad }),
    });
    const data = await res.json();

    if (!res.ok || !data.ok) {
      setMessage(data.error ?? "No se pudo agregar seriales");
      return;
    }

    setMessage(`${data.serials.length} seriales agregados al bloque "${nombre}"`);
    await load();
  }

  async function handleDeleteBloque(bloqueId: string | undefined, nombre: string) {
    if (!bloqueId) return;
    if (
      !confirm(
        `¿Borrar el bloque "${nombre}"? Se borraran todos sus seriales, salvo los que ya hicieron check-in. Esta accion no se puede deshacer.`
      )
    )
      return;

    setMessage(null);
    const res = await fetch(`/api/admin/bloques/${bloqueId}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok || !data.ok) {
      setMessage(data.error ?? "No se pudo borrar el bloque");
      return;
    }

    if (data.remaining === 0) {
      setMessage(`Bloque "${nombre}" borrado (${data.deletedCount} seriales).`);
      await load();
      return;
    }

    const forzar = confirm(
      `Quedaron ${data.remaining} seriales en "${nombre}" porque ya hicieron check-in, asi que el bloque sigue ahi.\n\n` +
        `¿Borrarlo de todas formas, incluyendo esos check-ins? Esto elimina el registro de asistencia de esos invitados y NO se puede deshacer.`
    );

    if (!forzar) {
      setMessage(
        `Se borraron ${data.deletedCount} seriales del bloque "${nombre}". Quedaron ${data.remaining} porque ya hicieron check-in.`
      );
      await load();
      return;
    }

    const forceRes = await fetch(`/api/admin/bloques/${bloqueId}?force=true`, { method: "DELETE" });
    const forceData = await forceRes.json();

    if (!forceRes.ok || !forceData.ok) {
      setMessage(forceData.error ?? "No se pudo forzar el borrado del bloque");
      await load();
      return;
    }

    setMessage(
      `Bloque "${nombre}" borrado por completo (${data.deletedCount + forceData.deletedCount} seriales, incluyendo los que ya hicieron check-in).`
    );
    await load();
  }

  if (loading) return <p className="text-neutral-500">Cargando...</p>;
  if (!funcion) return <p className="text-neutral-500">Funcion no encontrada.</p>;

  return (
    <div className="max-w-4xl space-y-8">
      <h1 className="text-2xl font-semibold">Seriales - Funcion {funcion.orden}</h1>

      {message && (
        <p className="rounded-md border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-200">
          {message}
        </p>
      )}

      <form
        onSubmit={handleGenerate}
        className="space-y-4 rounded-md border border-neutral-800 bg-neutral-900 p-4"
      >
        <h2 className="font-medium">Generar bloque de seriales</h2>

        <div className="flex flex-wrap gap-4">
          <div className="space-y-1">
            <label className="block text-sm text-neutral-400">Cantidad</label>
            <input
              type="number"
              min={1}
              max={remaining}
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              className="w-28 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2"
            />
          </div>

          <div className="flex-1 space-y-1">
            <label className="block text-sm text-neutral-400">Nombre del bloque</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Prensa, Gobierno, Publico general"
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2"
            />
          </div>

          <div className="flex-1 space-y-1">
            <label className="block text-sm text-neutral-400">Direccion (opcional)</label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="A donde se entrega este bloque"
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2"
            />
          </div>
        </div>

        <p className="text-sm text-neutral-500">
          Quedan {remaining} de {funcion.capacidad} disponibles para generar
        </p>

        <button
          type="submit"
          disabled={generating || remaining <= 0}
          className="rounded-md bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-600 disabled:opacity-50"
        >
          {generating ? "Generando..." : "Generar"}
        </button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-neutral-400">{selected.size} seleccionados</p>
        <button
          onClick={() =>
            handleExport(Array.from(selected), `invitaciones-funcion-${funcion.orden}.pdf`)
          }
          disabled={exporting || selected.size === 0}
          className="rounded-md border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-900 disabled:opacity-50"
        >
          {exporting ? "Exportando..." : "Exportar seleccionados"}
        </button>
      </div>

      <div className="space-y-6">
        {grupos.map((grupo) => (
          <div key={grupo.bloque?._id ?? "sin-bloque"} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-4 py-3">
              <div>
                <p className="font-medium">{grupo.bloque?.nombre ?? "Sin bloque"}</p>
                {grupo.bloque?.direccion && (
                  <p className="text-sm text-neutral-400">{grupo.bloque.direccion}</p>
                )}
                <p className="text-xs text-neutral-500">{grupo.serials.length} seriales</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddToBloque(grupo.bloque?._id, grupo.bloque?.nombre ?? "Sin bloque")}
                  disabled={!grupo.bloque}
                  className="rounded-md border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800 disabled:opacity-50"
                >
                  Agregar seriales
                </button>
                <button
                  onClick={() =>
                    handleExport(
                      grupo.serials.map((s) => s._id),
                      `invitaciones-${slugify(grupo.bloque?.nombre ?? "bloque")}.pdf`
                    )
                  }
                  disabled={exporting}
                  className="rounded-md border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800 disabled:opacity-50"
                >
                  Exportar bloque
                </button>
                <button
                  onClick={() => handleDeleteBloque(grupo.bloque?._id, grupo.bloque?.nombre ?? "Sin bloque")}
                  disabled={!grupo.bloque}
                  className="rounded-md border border-red-900 px-4 py-2 text-sm text-red-500 hover:bg-red-950 disabled:opacity-50"
                >
                  Borrar bloque
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-md border border-neutral-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-900 text-neutral-400">
                  <tr>
                    <th className="w-8 p-3"></th>
                    <th className="p-3">Codigo</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Asiento</th>
                    <th className="p-3">Invitado</th>
                    <th className="p-3">Check-in</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {grupo.serials.map((s) => (
                    <tr key={s._id} className="border-t border-neutral-800">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected.has(s._id)}
                          onChange={() => toggleSelected(s._id)}
                        />
                      </td>
                      <td className="p-3 font-mono">{s.codigo}</td>
                      <td className="p-3">{STATUS_LABEL[s.status]}</td>
                      <td className="p-3">{s.seatId ?? "-"}</td>
                      <td className="p-3">{s.guestName ?? "-"}</td>
                      <td className="p-3">{s.checkedIn ? "Si" : "No"}</td>
                      <td className="p-3">
                        <div className="flex gap-3">
                          {s.status === "disponible" && (
                            <button
                              onClick={() => handleInactivar(s.codigo)}
                              className="text-xs text-yellow-500 hover:underline"
                            >
                              Inactivar
                            </button>
                          )}
                          {!s.checkedIn && (
                            <button
                              onClick={() => handleDelete(s)}
                              className="text-xs text-red-500 hover:underline"
                            >
                              Borrar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        {serials.length === 0 && (
          <p className="text-sm text-neutral-500">Aun no hay seriales generados.</p>
        )}
      </div>
    </div>
  );
}
