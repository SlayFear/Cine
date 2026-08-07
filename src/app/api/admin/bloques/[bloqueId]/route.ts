import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Bloque from "@/models/Bloque";
import Invitacion from "@/models/Invitacion";

type RouteParams = { params: Promise<{ bloqueId: string }> };

// Borra todos los seriales del bloque salvo los que ya hicieron check-in (se
// preserva el registro de asistencia). El bloque en si solo se borra si no
// queda ningun serial, para que los que sobrevivan sigan agrupados.
// Con ?force=true tambien se borran los que ya hicieron check-in, perdiendo
// ese registro de asistencia; el caller debe confirmarlo explicitamente.
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { bloqueId } = await params;
  const force = new URL(request.url).searchParams.get("force") === "true";
  await connectDB();

  const bloque = await Bloque.findById(bloqueId);
  if (!bloque) {
    return NextResponse.json({ ok: false, error: "Bloque no encontrado" }, { status: 404 });
  }

  const filter = force ? { bloqueId } : { bloqueId, checkedIn: false };
  const { deletedCount } = await Invitacion.deleteMany(filter);
  const remaining = await Invitacion.countDocuments({ bloqueId });

  if (remaining === 0) {
    await bloque.deleteOne();
  }

  return NextResponse.json({ ok: true, deletedCount, remaining, forced: force });
}
