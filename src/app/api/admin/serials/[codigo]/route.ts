import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Invitacion from "@/models/Invitacion";

type RouteParams = { params: Promise<{ codigo: string }> };

export async function PATCH(_request: NextRequest, { params }: RouteParams) {
  const { codigo } = await params;
  await connectDB();

  const invitacion = await Invitacion.findOneAndUpdate(
    { codigo, status: "disponible" },
    { $set: { status: "cancelado" } },
    { returnDocument: "after" }
  );

  if (!invitacion) {
    return NextResponse.json(
      { ok: false, error: "El serial no existe o ya fue usado/cancelado" },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true, invitacion });
}

// Borrado definitivo: se permite aunque el serial ya este reservado o
// exportado (libera el asiento si tenia uno). Solo se bloquea si el invitado
// ya hizo check-in en la funcion, para no perder el registro de asistencia.
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { codigo } = await params;
  await connectDB();

  const invitacion = await Invitacion.findOne({ codigo });
  if (!invitacion) {
    return NextResponse.json({ ok: false, error: "El serial no existe" }, { status: 404 });
  }

  if (invitacion.checkedIn) {
    return NextResponse.json(
      { ok: false, error: "No se puede borrar: el invitado ya hizo check-in en la funcion" },
      { status: 409 }
    );
  }

  await invitacion.deleteOne();

  return NextResponse.json({ ok: true });
}
