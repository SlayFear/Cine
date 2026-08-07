import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Funcion from "@/models/Funcion";
import { funcionCreateSchema } from "@/lib/validators";
import { venueLocalToUtc } from "@/lib/timezone";

const MAX_FUNCIONES = 4;

export async function GET() {
  await connectDB();
  const funciones = await Funcion.find({}).sort({ orden: 1 });
  return NextResponse.json({ ok: true, funciones });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = funcionCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Datos invalidos" }, { status: 400 });
  }

  await connectDB();

  const count = await Funcion.countDocuments({});
  if (count >= MAX_FUNCIONES) {
    return NextResponse.json(
      { ok: false, error: `Ya existen ${MAX_FUNCIONES} funciones, el maximo permitido` },
      { status: 409 }
    );
  }

  const existente = await Funcion.findOne({ orden: parsed.data.orden });
  if (existente) {
    return NextResponse.json(
      { ok: false, error: `Ya existe una funcion con el orden ${parsed.data.orden}` },
      { status: 409 }
    );
  }

  const funcion = await Funcion.create({
    orden: parsed.data.orden,
    fechaHora: venueLocalToUtc(parsed.data.fechaHora),
  });

  return NextResponse.json({ ok: true, funcion }, { status: 201 });
}
