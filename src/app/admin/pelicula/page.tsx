"use client";

import { useEffect, useState } from "react";

interface Pelicula {
  _id: string;
  titulo: string;
  sinopsis: string;
  posterUrl: string;
  trailerYoutubeId: string;
}

export default function AdminPeliculaPage() {
  const [pelicula, setPelicula] = useState<Pelicula | null>(null);
  const [titulo, setTitulo] = useState("");
  const [sinopsis, setSinopsis] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/pelicula")
      .then((res) => res.json())
      .then((data) => {
        if (data.pelicula) {
          setPelicula(data.pelicula);
          setTitulo(data.pelicula.titulo);
          setSinopsis(data.pelicula.sinopsis ?? "");
          setTrailerUrl(
            data.pelicula.trailerYoutubeId
              ? `https://www.youtube.com/watch?v=${data.pelicula.trailerYoutubeId}`
              : ""
          );
        }
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/admin/pelicula", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, sinopsis, trailerUrl }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok || !data.ok) {
      setMessage(data.error ?? "No se pudo guardar");
      return;
    }

    setPelicula(data.pelicula);
    setMessage("Guardado");
  }

  async function handlePosterUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/pelicula/poster", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    e.target.value = "";

    if (!res.ok || !data.ok) {
      setMessage(data.error ?? "No se pudo subir la imagen");
      return;
    }

    setPelicula(data.pelicula);
  }

  if (loading) return <p className="text-neutral-500">Cargando...</p>;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Pelicula</h1>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm text-neutral-400">Titulo</label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm text-neutral-400">Sinopsis</label>
          <textarea
            value={sinopsis}
            onChange={(e) => setSinopsis(e.target.value)}
            rows={5}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm text-neutral-400">Trailer (link de YouTube)</label>
          <input
            value={trailerUrl}
            onChange={(e) => setTrailerUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
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
        <label className="block text-sm text-neutral-400">Poster</label>
        {pelicula?.posterUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pelicula.posterUrl} alt="Poster" className="h-64 w-full rounded-md object-cover" />
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePosterUpload}
          disabled={uploading}
          className="block text-sm text-neutral-400"
        />
        {uploading && <p className="text-sm text-neutral-500">Subiendo...</p>}
      </div>

      {message && <p className="text-sm text-neutral-300">{message}</p>}
    </div>
  );
}
