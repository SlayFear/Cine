import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Funcion from "@/models/Funcion";
import Invitacion from "@/models/Invitacion";
import { deleteUploadedImage } from "@/lib/storage";
import { funcionUpdateSchema } from "@/lib/validators";
import { venueLocalToUtc } from "@/lib/timezone";

type RouteParams = { params: Promise<{ funcionId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { funcionId } = await params;
  await connectDB();

  const funcion = await Funcion.findById(funcionId);
  if (!funcion) {
    return NextResponse.json({ ok: false, error: "Funcion no encontrada" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, funcion });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { funcionId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = funcionUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Datos invalidos" }, { status: 400 });
  }

  await connectDB();

  const { fechaHora, ...rest } = parsed.data;
  const update = fechaHora ? { ...rest, fechaHora: venueLocalToUtc(fechaHora) } : rest;

  const funcion = await Funcion.findByIdAndUpdate(funcionId, update, { returnDocument: "after" });
  if (!funcion) {
    return NextResponse.json({ ok: false, error: "Funcion no encontrada" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, funcion });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { funcionId } = await params;
  await connectDB();

  const funcion = await Funcion.findById(funcionId);
  if (!funcion) {
    return NextResponse.json({ ok: false, error: "Funcion no encontrada" }, { status: 404 });
  }

  const invitacionesCount = await Invitacion.countDocuments({ funcionId });
  if (invitacionesCount > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "No se puede borrar: ya tiene seriales generados. Usa 'cancelada' en su lugar",
      },
      { status: 409 }
    );
  }

  await deleteUploadedImage(funcion.flyerUrl);
  await funcion.deleteOne();

  return NextResponse.json({ ok: true });
}
