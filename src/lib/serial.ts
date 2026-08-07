import { customAlphabet } from "nanoid";

// Sin caracteres ambiguos para impresion/lectura manual (sin 0/O, 1/I/L).
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const generate = customAlphabet(ALPHABET, 12);

export function generateSerialCode(): string {
  const raw = generate();
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function invitationUrlFor(codigo: string): string {
  return `${getSiteUrl()}/invitacion?code=${encodeURIComponent(codigo)}`;
}

/**
 * El escaner de taquilla puede leer el QR de una invitacion (que codifica una
 * URL tipo ".../invitacion?code=AB3D-K92Q") o el staff puede teclear el
 * codigo directo. Esto normaliza cualquiera de los dos a solo el codigo.
 */
export function extractCodeFromScan(text: string): string {
  const trimmed = text.trim();
  try {
    const url = new URL(trimmed);
    return url.searchParams.get("code")?.trim().toUpperCase() ?? trimmed.toUpperCase();
  } catch {
    return trimmed.toUpperCase();
  }
}
