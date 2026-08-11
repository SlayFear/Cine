import { NextRequest, NextResponse } from "next/server";
import { getConfirmacionData } from "@/lib/confirmacion";
import { formatVenueDate, formatVenueTime } from "@/lib/timezone";

type RouteParams = { params: Promise<{ codigo: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { codigo } = await params;
  const data = await getConfirmacionData(codigo);

  if (!data) {
    return NextResponse.json(
      { ok: false, error: "No se encontro un pase reservado con ese codigo" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    codigo: data.codigo,
    seatId: data.seatId,
    peliculaTitulo: data.peliculaTitulo,
    posterUrl: data.posterUrl,
    qrDataUrl: data.qrDataUrl,
    funcionLabel: data.funcion
      ? `${formatVenueDate(data.funcion.fechaHora)} · ${formatVenueTime(data.funcion.fechaHora)}`
      : "",
  });
}
