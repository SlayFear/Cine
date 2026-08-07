import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Invitacion from "@/models/Invitacion";
import Funcion from "@/models/Funcion";
import { SEAT_ROWS } from "@/lib/seatLayout";

type RouteParams = { params: Promise<{ funcionId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { funcionId } = await params;

  await connectDB();

  const funcion = await Funcion.findById(funcionId);
  if (!funcion || !funcion.activa || funcion.cancelada) {
    return NextResponse.json(
      { ok: false, error: "Esta funcion ya no esta disponible" },
      { status: 404 }
    );
  }

  const reservados = await Invitacion.find({ funcionId, status: "reservado" }).select("seatId");
  const ocupados = new Set(reservados.map((r) => r.seatId));

  const rows = SEAT_ROWS.map((row) => ({
    rowLabel: row.rowLabel,
    seats: row.seats.map((seat) => ({
      ...seat,
      ocupado: ocupados.has(seat.id),
    })),
  }));

  return NextResponse.json({ ok: true, rows });
}
