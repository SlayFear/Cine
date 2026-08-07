import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Bloque from "@/models/Bloque";
import Invitacion from "@/models/Invitacion";
import { TOTAL_SEATS } from "@/lib/seatLayout";
import { createInvitaciones } from "@/lib/invitaciones";
import { bloqueAddSerialsSchema } from "@/lib/validators";

type RouteParams = { params: Promise<{ bloqueId: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { bloqueId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = bloqueAddSerialsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Datos invalidos" }, { status: 400 });
  }

  await connectDB();

  const bloque = await Bloque.findById(bloqueId);
  if (!bloque) {
    return NextResponse.json({ ok: false, error: "Bloque no encontrado" }, { status: 404 });
  }

  const existingCount = await Invitacion.countDocuments({ funcionId: bloque.funcionId });
  const remaining = TOTAL_SEATS - existingCount;

  if (parsed.data.cantidad > remaining) {
    return NextResponse.json(
      {
        ok: false,
        error: `Solo quedan ${remaining} seriales disponibles para esta funcion (aforo ${TOTAL_SEATS})`,
      },
      { status: 409 }
    );
  }

  const created = await createInvitaciones(
    bloque.funcionId.toString(),
    bloque._id.toString(),
    parsed.data.cantidad
  );

  bloque.cantidad += created.length;
  await bloque.save();

  return NextResponse.json({ ok: true, bloque, serials: created }, { status: 201 });
}
