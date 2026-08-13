import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Funcion from "@/models/Funcion";
import Invitacion from "@/models/Invitacion";
import Pelicula from "@/models/Pelicula";
import { buildInvitationsListPdf } from "@/lib/pdf";
import { serialsExportSchema } from "@/lib/validators";
import { formatVenueDateTime } from "@/lib/timezone";

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
  }).populate("bloqueId", "nombre");

  if (serials.length === 0) {
    return NextResponse.json({ ok: false, error: "No se encontraron seriales" }, { status: 404 });
  }

  const pelicula = await Pelicula.findOne({});

  const bloqueNombres = new Set(
    serials.map((s) => (s.bloqueId as unknown as { nombre?: string } | null)?.nombre ?? "Sin bloque")
  );
  const title =
    bloqueNombres.size === 1
      ? `Invitaciones - Funcion ${funcion.orden} - ${[...bloqueNombres][0]}`
      : `Invitaciones - Funcion ${funcion.orden}`;

  const pdfBuffer = await buildInvitationsListPdf(
    title,
    serials.map((s) => ({
      codigo: s.codigo,
      guestName: s.guestName ?? "-",
      funcionFechaHora: funcion.fechaHora,
      status: s.status,
    })),
    { posterUrl: pelicula?.posterUrl, subtitle: formatVenueDateTime(funcion.fechaHora) }
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
