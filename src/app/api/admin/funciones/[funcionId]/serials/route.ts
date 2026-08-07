import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Funcion from "@/models/Funcion";
import Invitacion from "@/models/Invitacion";
import Bloque from "@/models/Bloque";
import { TOTAL_SEATS } from "@/lib/seatLayout";
import { createInvitaciones } from "@/lib/invitaciones";
import { serialsGenerateSchema } from "@/lib/validators";

type RouteParams = { params: Promise<{ funcionId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { funcionId } = await params;
  await connectDB();

  const serials = await Invitacion.find({ funcionId })
    .populate("bloqueId")
    .sort({ createdAt: -1 });
  return NextResponse.json({ ok: true, serials });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { funcionId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = serialsGenerateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Datos invalidos" }, { status: 400 });
  }

  await connectDB();

  const funcion = await Funcion.findById(funcionId);
  if (!funcion) {
    return NextResponse.json({ ok: false, error: "Funcion no encontrada" }, { status: 404 });
  }

  const existingCount = await Invitacion.countDocuments({ funcionId });
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

  const bloque = await Bloque.create({
    funcionId,
    nombre: parsed.data.nombre,
    direccion: parsed.data.direccion,
    cantidad: parsed.data.cantidad,
  });

  const created = await createInvitaciones(funcionId, bloque._id.toString(), parsed.data.cantidad);

  return NextResponse.json({ ok: true, bloque, serials: created }, { status: 201 });
}
