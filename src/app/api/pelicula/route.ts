import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Pelicula from "@/models/Pelicula";
import Funcion from "@/models/Funcion";

export async function GET() {
  await connectDB();

  const [pelicula, funciones] = await Promise.all([
    Pelicula.findOne({}),
    Funcion.find({ activa: true, cancelada: false })
      .sort({ fechaHora: 1 })
      .select("orden fechaHora flyerUrl capacidad"),
  ]);

  return NextResponse.json({ ok: true, pelicula: pelicula ?? null, funciones });
}
