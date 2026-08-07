import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Pelicula from "@/models/Pelicula";
import { peliculaUpdateSchema } from "@/lib/validators";
import { extractYoutubeId } from "@/lib/youtube";

export async function GET() {
  await connectDB();
  const pelicula = await Pelicula.findOne({});
  return NextResponse.json({ ok: true, pelicula: pelicula ?? null });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = peliculaUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Datos invalidos" }, { status: 400 });
  }

  let trailerYoutubeId = "";
  if (parsed.data.trailerUrl) {
    const id = extractYoutubeId(parsed.data.trailerUrl);
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "El link del trailer no parece ser una URL valida de YouTube" },
        { status: 400 }
      );
    }
    trailerYoutubeId = id;
  }

  await connectDB();

  const pelicula = await Pelicula.findOneAndUpdate(
    {},
    { titulo: parsed.data.titulo, sinopsis: parsed.data.sinopsis, trailerYoutubeId },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  return NextResponse.json({ ok: true, pelicula });
}
