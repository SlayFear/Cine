import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Pelicula from "@/models/Pelicula";
import { deleteUploadedImage, saveUploadedImage, UploadError } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Falta el archivo" }, { status: 400 });
  }

  try {
    await connectDB();
    const previous = await Pelicula.findOne({});

    const posterUrl = await saveUploadedImage(file);

    const pelicula = await Pelicula.findOneAndUpdate(
      {},
      { posterUrl },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    await deleteUploadedImage(previous?.posterUrl);

    return NextResponse.json({ ok: true, pelicula });
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
    throw err;
  }
}
