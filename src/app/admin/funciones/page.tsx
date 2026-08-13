"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Funcion {
  _id: string;
  orden: number;
  fechaHora: string;
  flyerUrl: string;
  activa: boolean;
  cancelada: boolean;
  capacidad: number;
}

export default function AdminFuncionesPage() {
  const [funciones, setFunciones] = useState<Funcion[]>([]);
  const [orden, setOrden] = useState(1);
  const [fechaHora, setFechaHora] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/funciones");
    const data = await res.json();
    setFunciones(data.funciones ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const ordenesDisponibles = [1, 2, 3, 4].filter(
    (n) => !funciones.some((f) => f.orden === n)
  );

  useEffect(() => {
    if (ordenesDisponibles.length > 0 && !ordenesDisponibles.includes(orden)) {
      // El select solo puede mostrar valores de ordenesDisponibles; si el
      // numero elegido ya no esta en la lista (ej. se acaba de crear esa
      // funcion), hay que re-sincronizar el estado con lo que el select
      // realmente esta mostrando, si no se manda un "orden" que ya no
      // corresponde a la opcion que el usuario ve seleccionada.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrden(ordenesDisponibles[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funciones]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);

    const res = await fetch("/api/admin/funciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orden, fechaHora }),
    });
    const data = await res.json();
    setCreating(false);

    if (!res.ok || !data.ok) {
      setError(data.error ?? "No se pudo crear la funcion");
      return;
    }

    setFechaHora("");
    await load();
  }

  if (loading) return <p className="text-neutral-500">Cargando...</p>;

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-2xl font-semibold">Funciones</h1>

      <div className="space-y-2">
        {funciones.map((f) => (
          <div
            key={f._id}
            className="flex flex-col gap-3 rounded-md border border-neutral-800 bg-neutral-900 px-4 py-3 hover:border-neutral-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <Link href={`/admin/funciones/${f._id}`} className="flex-1">
              <p className="font-medium">Funcion {f.orden}</p>
              <p className="text-sm text-neutral-400">
                {new Date(f.fechaHora).toLocaleString("es-MX", { timeZone: "America/Chihuahua" })}
              </p>
            </Link>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex gap-2 text-xs">
                {f.cancelada && <span className="rounded bg-red-900 px-2 py-1">Cancelada</span>}
                {!f.activa && !f.cancelada && (
                  <span className="rounded bg-neutral-800 px-2 py-1">Inactiva</span>
                )}
                {f.activa && !f.cancelada && (
                  <span className="rounded bg-green-900 px-2 py-1">Activa</span>
                )}
              </div>
              <Link
                href={`/admin/funciones/${f._id}/serials`}
                className="rounded-md border border-neutral-700 px-3 py-1.5 text-center text-xs text-neutral-300 hover:border-neutral-500 hover:text-white"
              >
                Ver seriales
              </Link>
            </div>
          </div>
        ))}
        {funciones.length === 0 && (
          <p className="text-sm text-neutral-500">Aun no hay funciones creadas.</p>
        )}
      </div>

      {ordenesDisponibles.length > 0 && (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-md border border-neutral-800 bg-neutral-900 p-4"
        >
          <h2 className="font-medium">Crear funcion</h2>

          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <label className="block text-sm text-neutral-400">Numero</label>
              <select
                value={orden}
                onChange={(e) => setOrden(Number(e.target.value))}
                className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2"
              >
                {ordenesDisponibles.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 space-y-1">
              <label className="block text-sm text-neutral-400">Fecha y hora</label>
              <input
                type="datetime-local"
                required
                value={fechaHora}
                onChange={(e) => setFechaHora(e.target.value)}
                className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={creating}
            className="rounded-md bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-600 disabled:opacity-50"
          >
            {creating ? "Creando..." : "Crear funcion"}
          </button>
        </form>
      )}
    </div>
  );
}
