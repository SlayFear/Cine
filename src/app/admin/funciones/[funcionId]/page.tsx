"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { utcToVenueLocalInputValue } from "@/lib/timezone";

interface Funcion {
  _id: string;
  orden: number;
  fechaHora: string;
  flyerUrl: string;
  activa: boolean;
  cancelada: boolean;
  capacidad: number;
}

export default function AdminFuncionDetailPage() {
  const { funcionId } = useParams<{ funcionId: string }>();
  const router = useRouter();

  const [funcion, setFuncion] = useState<Funcion | null>(null);
  const [fechaHora, setFechaHora] = useState("");
  const [activa, setActiva] = useState(true);
  const [cancelada, setCancelada] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/funciones/${funcionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.funcion) {
          setFuncion(data.funcion);
          setFechaHora(utcToVenueLocalInputValue(data.funcion.fechaHora));
          setActiva(data.funcion.activa);
          setCancelada(data.funcion.cancelada);
        }
        setLoading(false);
      });
  }, [funcionId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch(`/api/admin/funciones/${funcionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fechaHora, activa, cancelada }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok || !data.ok) {
      setMessage(data.error ?? "No se pudo guardar");
      return;
    }

    setFuncion(data.funcion);
    setMessage("Guardado");
  }

  async function handleFlyerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/admin/funciones/${funcionId}/flyer`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setUploading(false);
    e.target.value = "";

    if (!res.ok || !data.ok) {
      setMessage(data.error ?? "No se pudo subir la imagen");
      return;
    }

    setFuncion(data.funcion);
  }

  async function handleDelete() {
    if (!confirm("¿Borrar esta funcion? Solo es posible si aun no tiene seriales generados.")) return;

    setDeleting(true);
    const res = await fetch(`/api/admin/funciones/${funcionId}`, { method: "DELETE" });
    const data = await res.json();
    setDeleting(false);

    if (!res.ok || !data.ok) {
      setMessage(data.error ?? "No se pudo borrar");
      return;
    }

    router.push("/admin/funciones");
  }

  if (loading) return <p className="text-neutral-500">Cargando...</p>;
  if (!funcion) return <p className="text-neutral-500">Funcion no encontrada.</p>;

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Funcion {funcion.orden}</h1>
        <Link
          href={`/admin/funciones/${funcion._id}/serials`}
          className="text-sm text-neutral-300 underline hover:text-white"
        >
          Ver seriales
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm text-neutral-400">Fecha y hora</label>
          <input
            type="datetime-local"
            required
            value={fechaHora}
            onChange={(e) => setFechaHora(e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input type="checkbox" checked={activa} onChange={(e) => setActiva(e.target.checked)} />
            Activa (visible en el sitio)
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input
              type="checkbox"
              checked={cancelada}
              onChange={(e) => setCancelada(e.target.checked)}
            />
            Cancelada
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-600 disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </form>

      <div className="space-y-2 border-t border-neutral-800 pt-6">
        <label className="block text-sm text-neutral-400">Flyer</label>
        {funcion.flyerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={funcion.flyerUrl} alt="Flyer" className="h-64 rounded-md object-cover" />
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFlyerUpload}
          disabled={uploading}
          className="block text-sm text-neutral-400"
        />
        {uploading && <p className="text-sm text-neutral-500">Subiendo...</p>}
      </div>

      {message && <p className="text-sm text-neutral-300">{message}</p>}

      <div className="border-t border-neutral-800 pt-6">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-md border border-red-900 px-4 py-2 text-sm text-red-500 hover:bg-red-950 disabled:opacity-50"
        >
          {deleting ? "Borrando..." : "Borrar funcion"}
        </button>
      </div>
    </div>
  );
}
