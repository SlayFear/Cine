/**
 * Acepta cualquier formato comun de URL de YouTube (watch, youtu.be, embed)
 * o el ID crudo, y regresa solo el video ID. Regresa null si no pudo
 * reconocer nada (para no guardar basura en la base de datos).
 */
export function extractYoutubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);

    if (url.hostname.includes("youtu.be")) {
      return url.pathname.slice(1) || null;
    }

    if (url.hostname.includes("youtube.com")) {
      if (url.pathname === "/watch") return url.searchParams.get("v");
      if (url.pathname.startsWith("/embed/")) return url.pathname.split("/embed/")[1] || null;
    }

    return null;
  } catch {
    // No es una URL valida; puede que ya sea el ID directo (11 caracteres).
    return /^[\w-]{11}$/.test(trimmed) ? trimmed : null;
  }
}

export function youtubeEmbedUrl(
  videoId: string,
  options?: { autoplay?: boolean; mute?: boolean }
): string {
  const params = new URLSearchParams();
  if (options?.autoplay) params.set("autoplay", "1");
  if (options?.mute) params.set("mute", "1");
  if (options?.autoplay) params.set("playsinline", "1");

  const query = params.toString();
  return `https://www.youtube.com/embed/${videoId}${query ? `?${query}` : ""}`;
}
