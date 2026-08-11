import { connectDB } from "@/lib/db";
import Invitacion from "@/models/Invitacion";
import Funcion from "@/models/Funcion";
import Pelicula from "@/models/Pelicula";
import { generateQrDataUrl } from "@/lib/qrcode";
import { invitationUrlFor } from "@/lib/serial";
import { EVENT_FALLBACK_POSTER } from "@/lib/eventConfig";

export interface ConfirmacionData {
  codigo: string;
  seatId: string | null;
  guestName: string | null;
  checkedIn: boolean;
  qrDataUrl: string;
  funcion: { orden: number; fechaHora: Date } | null;
  peliculaTitulo: string;
  posterUrl: string;
}

export async function getConfirmacionData(codigo: string): Promise<ConfirmacionData | null> {
  await connectDB();

  const invitacion = await Invitacion.findOne({ codigo: codigo.toUpperCase(), status: "reservado" });
  if (!invitacion) return null;

  const [funcion, pelicula, qrDataUrl] = await Promise.all([
    Funcion.findById(invitacion.funcionId),
    Pelicula.findOne({}),
    generateQrDataUrl(invitationUrlFor(invitacion.codigo)),
  ]);

  return {
    codigo: invitacion.codigo,
    seatId: invitacion.seatId,
    guestName: invitacion.guestName,
    checkedIn: invitacion.checkedIn,
    qrDataUrl,
    funcion: funcion ? { orden: funcion.orden, fechaHora: funcion.fechaHora } : null,
    peliculaTitulo: pelicula?.titulo ?? "CineRejon",
    posterUrl: pelicula?.posterUrl || EVENT_FALLBACK_POSTER,
  };
}
