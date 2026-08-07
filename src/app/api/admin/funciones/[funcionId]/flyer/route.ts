import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Funcion from "@/models/Funcion";
import { deleteUploadedImage, saveUploadedImage, UploadError } from "@/lib/storage";

type RouteParams = { params: Promise<{ funcionId: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { funcionId } = await params;
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Falta el archivo" }, { status: 400 });
  }

  await connectDB();
  const funcion = await Funcion.findById(funcionId);
  if (!funcion) {
    return NextResponse.json({ ok: false, error: "Funcion no encontrada" }, { status: 404 });
  }

  try {
    const flyerUrl = await saveUploadedImage(file);
    const previousFlyerUrl = funcion.flyerUrl;

    funcion.flyerUrl = flyerUrl;
    await funcion.save();

    await deleteUploadedImage(previousFlyerUrl);

    return NextResponse.json({ ok: true, funcion });
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
    throw err;
  }
}
