import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Invitacion from "@/models/Invitacion";
import Funcion from "@/models/Funcion";
import Pelicula from "@/models/Pelicula";
import { getSeatById, isValidSeatId } from "@/lib/seatLayout";
import { reservaSchema } from "@/lib/validators";
import { sendConfirmationEmail } from "@/lib/mailer";

const DUPLICATE_KEY_ERROR = 11000;

function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: number }).code === DUPLICATE_KEY_ERROR
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = reservaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Datos invalidos" }, { status: 400 });
  }

  const seat = getSeatById(parsed.data.seatId);
  if (!isValidSeatId(parsed.data.seatId) || !seat) {
    return NextResponse.json({ ok: false, error: "Asiento invalido" }, { status: 400 });
  }

  const codigo = parsed.data.codigo.trim().toUpperCase();

  await connectDB();

  const funcion = await Funcion.findById(parsed.data.funcionId);
  if (!funcion || !funcion.activa || funcion.cancelada) {
    return NextResponse.json(
      { ok: false, error: "Esta funcion ya no esta disponible" },
      { status: 409 }
    );
  }

  const invitacionActual = await Invitacion.findOne({ codigo, funcionId: parsed.data.funcionId });
  if (!invitacionActual) {
    return NextResponse.json(
      { ok: false, error: "Codigo de invitacion no encontrado", reason: "invalid_code" },
      { status: 404 }
    );
  }
  if (invitacionActual.status === "reservado") {
    return NextResponse.json(
      {
        ok: false,
        error: "Este codigo ya fue utilizado para apartar un asiento",
        reason: "invalid_code",
      },
      { status: 409 }
    );
  }
  if (invitacionActual.status === "cancelado") {
    return NextResponse.json(
      { ok: false, error: "Este codigo ya no es valido", reason: "invalid_code" },
      { status: 409 }
    );
  }

  try {
    const reservada = await Invitacion.findOneAndUpdate(
      { codigo, funcionId: parsed.data.funcionId, status: "disponible" },
      {
        $set: {
          status: "reservado",
          seatId: seat.id,
          seatRow: seat.rowLabel,
          seatNumber: seat.seatNumber,
          guestName: parsed.data.guestName,
          guestEmail: parsed.data.guestEmail.toLowerCase(),
          reservedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!reservada) {
      return NextResponse.json(
        { ok: false, error: "Tu invitacion ya no esta disponible", reason: "invalid_code" },
        { status: 409 }
      );
    }

    const pelicula = await Pelicula.findOne({});
    const emailEnviado = await sendConfirmationEmail({
      to: reservada.guestEmail!,
      guestName: reservada.guestName!,
      peliculaTitulo: pelicula?.titulo ?? "CineRejon",
      funcionOrden: funcion.orden,
      funcionFechaHora: funcion.fechaHora,
      seatId: reservada.seatId!,
      codigo: reservada.codigo,
    });

    if (emailEnviado) {
      reservada.confirmationEmailSentAt = new Date();
      await reservada.save();
    }

    return NextResponse.json({
      ok: true,
      codigo: reservada.codigo,
      seatId: reservada.seatId,
    });
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      return NextResponse.json(
        { ok: false, error: "Ese asiento ya fue tomado, elige otro", reason: "seat_taken" },
        { status: 409 }
      );
    }
    throw err;
  }
}
