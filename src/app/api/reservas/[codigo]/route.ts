import { NextRequest, NextResponse } from "next/server";
import { getConfirmacionData } from "@/lib/confirmacion";

type RouteParams = { params: Promise<{ codigo: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { codigo } = await params;

  const data = await getConfirmacionData(codigo);
  if (!data) {
    return NextResponse.json({ ok: false, error: "Reservacion no encontrada" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, ...data });
}
