import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Invitacion from "@/models/Invitacion";
import Funcion from "@/models/Funcion";
import Pelicula from "@/models/Pelicula";
import { extractCodeFromScan } from "@/lib/serial";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("codigo");
  if (!raw) {
    return NextResponse.json({ ok: false, error: "Falta el codigo" }, { status: 400 });
  }

  const codigo = extractCodeFromScan(raw);

  await connectDB();

  const invitacion = await Invitacion.findOne({ codigo });
  if (!invitacion) {
    return NextResponse.json({ ok: false, error: "Codigo no encontrado" }, { status: 404 });
  }

  if (invitacion.status !== "reservado") {
    return NextResponse.json(
      { ok: false, error: "Este codigo no tiene una reservacion activa" },
      { status: 409 }
    );
  }

  const [funcion, pelicula] = await Promise.all([
    Funcion.findById(invitacion.funcionId),
    Pelicula.findOne({}),
  ]);

  return NextResponse.json({
    ok: true,
    codigo: invitacion.codigo,
    guestName: invitacion.guestName,
    seatId: invitacion.seatId,
    checkedIn: invitacion.checkedIn,
    checkedInAt: invitacion.checkedInAt,
    peliculaTitulo: pelicula?.titulo ?? "CineRejon",
    funcion: funcion ? { orden: funcion.orden, fechaHora: funcion.fechaHora } : null,
  });
}
