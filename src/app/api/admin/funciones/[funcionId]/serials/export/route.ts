import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Funcion from "@/models/Funcion";
import Invitacion from "@/models/Invitacion";
import Pelicula from "@/models/Pelicula";
import { buildInvitationsListPdf } from "@/lib/pdf";
import { serialsExportSchema } from "@/lib/validators";

type RouteParams = { params: Promise<{ funcionId: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { funcionId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = serialsExportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Datos invalidos" }, { status: 400 });
  }

  await connectDB();

  const funcion = await Funcion.findById(funcionId);
  if (!funcion) {
    return NextResponse.json({ ok: false, error: "Funcion no encontrada" }, { status: 404 });
  }

  const serials = await Invitacion.find({
    _id: { $in: parsed.data.serialIds },
    funcionId,
  });

  if (serials.length === 0) {
    return NextResponse.json({ ok: false, error: "No se encontraron seriales" }, { status: 404 });
  }

  const pelicula = await Pelicula.findOne({});

  const pdfBuffer = await buildInvitationsListPdf(
    `Invitaciones - Funcion ${funcion.orden}`,
    serials.map((s) => ({
      codigo: s.codigo,
      peliculaTitulo: pelicula?.titulo ?? "CineRejon",
      funcionFechaHora: funcion.fechaHora,
      status: s.status,
    })),
    { posterUrl: pelicula?.posterUrl }
  );

  await Invitacion.updateMany(
    { _id: { $in: serials.map((s) => s._id) } },
    { $set: { exportedAt: new Date() }, $inc: { exportCount: 1 } }
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invitaciones-funcion-${funcion.orden}.pdf"`,
    },
  });
}
