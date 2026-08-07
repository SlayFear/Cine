import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { TOTAL_SEATS, ROOM_LAYOUT_VERSION } from "@/lib/seatLayout";

const FuncionSchema = new Schema(
  {
    orden: { type: Number, required: true, unique: true, min: 1, max: 4 },
    fechaHora: { type: Date, required: true },
    flyerUrl: { type: String, default: "" },
    activa: { type: Boolean, default: true },
    cancelada: { type: Boolean, default: false },
    capacidad: { type: Number, default: TOTAL_SEATS },
    layoutVersion: { type: String, default: ROOM_LAYOUT_VERSION },
  },
  { timestamps: true }
);

export type FuncionDoc = InferSchemaType<typeof FuncionSchema>;

export default mongoose.models.Funcion || mongoose.model("Funcion", FuncionSchema);
