import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Invitacion from "@/models/Invitacion";
import Funcion from "@/models/Funcion";
import { validarInvitacionSchema } from "@/lib/validators";

/**
 * Solo hace lookup (no reserva nada): dado un codigo, dice a que funcion
 * pertenece. La usa /invitacion para redirigir directo al mapa de asientos
 * de esa funcion cuando alguien entra desde un QR ya impreso/emitido. La
 * reserva real (que sí valida el codigo de nuevo) pasa en /api/reservas.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = validarInvitacionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Ingresa tu codigo de invitacion" }, { status: 400 });
  }

  const codigo = parsed.data.codigo.trim().toUpperCase();

  await connectDB();

  const invitacion = await Invitacion.findOne({ codigo });
  if (!invitacion) {
    return NextResponse.json({ ok: false, error: "Codigo no encontrado" }, { status: 404 });
  }

  if (invitacion.status === "reservado") {
    return NextResponse.json(
      { ok: false, error: "Este codigo ya fue utilizado para apartar un asiento" },
      { status: 409 }
    );
  }
  if (invitacion.status === "cancelado") {
    return NextResponse.json({ ok: false, error: "Este codigo ya no es valido" }, { status: 409 });
  }

  const funcion = await Funcion.findById(invitacion.funcionId);
  if (!funcion || !funcion.activa || funcion.cancelada) {
    return NextResponse.json(
      { ok: false, error: "Esta funcion ya no esta disponible" },
      { status: 409 }
    );
  }

  return NextResponse.json({
    ok: true,
    codigo: invitacion.codigo,
    funcion: {
      _id: funcion._id.toString(),
      orden: funcion.orden,
      fechaHora: funcion.fechaHora,
      flyerUrl: funcion.flyerUrl,
    },
  });
}
