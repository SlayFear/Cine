import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const peliculaUpdateSchema = z.object({
  titulo: z.string().trim().min(1),
  sinopsis: z.string().trim().max(4000).optional().default(""),
  trailerUrl: z.string().trim().max(500).optional().default(""),
});

// fechaHora llega como string "sin zona" desde un <input type="datetime-local">
// (ej. "2026-08-05T19:00"), se asume hora local de la sala y se convierte a UTC
// explicitamente con venueLocalToUtc() en el route handler, no aqui.
const fechaHoraLocal = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, "Formato de fecha invalido");

export const funcionCreateSchema = z.object({
  orden: z.coerce.number().int().min(1).max(4),
  fechaHora: fechaHoraLocal,
});

export const funcionUpdateSchema = z.object({
  fechaHora: fechaHoraLocal.optional(),
  activa: z.boolean().optional(),
  cancelada: z.boolean().optional(),
});

export const serialsGenerateSchema = z.object({
  cantidad: z.coerce.number().int().min(1).max(99),
  nombre: z.string().trim().min(1).max(200),
  direccion: z.string().trim().max(500).optional().default(""),
});

export const bloqueAddSerialsSchema = z.object({
  cantidad: z.coerce.number().int().min(1).max(99),
});

export const serialsExportSchema = z.object({
  serialIds: z.array(z.string().min(1)).min(1),
});

export const validarInvitacionSchema = z.object({
  codigo: z.string().trim().min(1),
});

export const reservaSchema = z.object({
  funcionId: z.string().trim().min(1),
  codigo: z.string().trim().min(1),
  seatId: z.string().trim().min(1),
  guestName: z.string().trim().min(1).max(200),
  guestEmail: z.string().trim().email(),
});

export const checkinSchema = z.object({
  codigo: z.string().trim().min(1),
});
