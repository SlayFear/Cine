import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const PUBLIC_PREFIX = "/uploads";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export class UploadError extends Error {}

export async function saveUploadedImage(file: File): Promise<string> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new UploadError("Formato de imagen no soportado (usa JPG, PNG o WEBP)");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new UploadError("La imagen no debe pesar mas de 5MB");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const extension = EXTENSION_BY_MIME[file.type];
  const filename = `${nanoid(12)}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return `${PUBLIC_PREFIX}/${filename}`;
}

export async function deleteUploadedImage(publicUrl: string | null | undefined): Promise<void> {
  if (!publicUrl || !publicUrl.startsWith(PUBLIC_PREFIX)) return;

  const filename = publicUrl.slice(PUBLIC_PREFIX.length + 1);
  // Nunca permitir que el nombre de archivo salga de UPLOAD_DIR.
  if (!filename || filename.includes("/") || filename.includes("..")) return;

  await unlink(path.join(UPLOAD_DIR, filename)).catch(() => {});
}
