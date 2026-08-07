import mongoose, { Schema, type InferSchemaType } from "mongoose";

const BloqueSchema = new Schema(
  {
    funcionId: { type: Schema.Types.ObjectId, ref: "Funcion", required: true, index: true },
    nombre: { type: String, required: true, trim: true },
    direccion: { type: String, default: "", trim: true },
    cantidad: { type: Number, required: true },
  },
  { timestamps: true }
);

export type BloqueDoc = InferSchemaType<typeof BloqueSchema>;

export default mongoose.models.Bloque || mongoose.model("Bloque", BloqueSchema);
