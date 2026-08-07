import mongoose, { Schema, type InferSchemaType } from "mongoose";

export const INVITACION_STATUS = ["disponible", "reservado", "cancelado"] as const;
export type InvitacionStatus = (typeof INVITACION_STATUS)[number];

const InvitacionSchema = new Schema(
  {
    codigo: { type: String, required: true, unique: true },
    funcionId: { type: Schema.Types.ObjectId, ref: "Funcion", required: true, index: true },
    status: { type: String, enum: INVITACION_STATUS, default: "disponible" },

    seatId: { type: String, default: null },
    seatRow: { type: String, default: null },
    seatNumber: { type: Number, default: null },

    guestName: { type: String, default: null, trim: true },
    guestEmail: { type: String, default: null, lowercase: true, trim: true },
    reservedAt: { type: Date, default: null },

    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date, default: null },

    confirmationEmailSentAt: { type: Date, default: null },

    bloqueId: { type: Schema.Types.ObjectId, ref: "Bloque", default: null, index: true },
    exportedAt: { type: Date, default: null },
    exportCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Garantiza que dos invitaciones distintas nunca reserven el mismo asiento
// en la misma funcion (la condicion de carrera se resuelve aqui, no en la app).
InvitacionSchema.index(
  { funcionId: 1, seatId: 1 },
  { unique: true, partialFilterExpression: { seatId: { $type: "string" } } }
);

InvitacionSchema.index({ funcionId: 1, status: 1 });

export type InvitacionDoc = InferSchemaType<typeof InvitacionSchema>;

export default mongoose.models.Invitacion || mongoose.model("Invitacion", InvitacionSchema);
