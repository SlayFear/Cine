import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Invitacion from "@/models/Invitacion";
import { checkinSchema } from "@/lib/validators";
import { extractCodeFromScan } from "@/lib/serial";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = checkinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Falta el codigo" }, { status: 400 });
  }

  const codigo = extractCodeFromScan(parsed.data.codigo);

  await connectDB();

  const actualizada = await Invitacion.findOneAndUpdate(
    { codigo, status: "reservado", checkedIn: false },
    { $set: { checkedIn: true, checkedInAt: new Date() } },
    { returnDocument: "after" }
  );

  if (actualizada) {
    return NextResponse.json({
      ok: true,
      alreadyCheckedIn: false,
      codigo: actualizada.codigo,
      guestName: actualizada.guestName,
      seatId: actualizada.seatId,
      checkedInAt: actualizada.checkedInAt,
    });
  }

  const existente = await Invitacion.findOne({ codigo });
  if (!existente) {
    return NextResponse.json({ ok: false, error: "Codigo no encontrado" }, { status: 404 });
  }
  if (existente.status !== "reservado") {
    return NextResponse.json(
      { ok: false, error: "Este codigo no tiene una reservacion activa" },
      { status: 409 }
    );
  }

  return NextResponse.json({
    ok: true,
    alreadyCheckedIn: true,
    codigo: existente.codigo,
    guestName: existente.guestName,
    seatId: existente.seatId,
    checkedInAt: existente.checkedInAt,
  });
}
