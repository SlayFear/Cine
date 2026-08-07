import mongoose, { Schema, type InferSchemaType } from "mongoose";

const PeliculaSchema = new Schema(
  {
    titulo: { type: String, required: true, trim: true },
    sinopsis: { type: String, default: "" },
    posterUrl: { type: String, default: "" },
    trailerYoutubeId: { type: String, default: "" },
  },
  { timestamps: true }
);

export type PeliculaDoc = InferSchemaType<typeof PeliculaSchema>;

export default mongoose.models.Pelicula || mongoose.model("Pelicula", PeliculaSchema);
