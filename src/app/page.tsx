import { connectDB } from "@/lib/db";
import Pelicula from "@/models/Pelicula";
import Funcion from "@/models/Funcion";
import LandingHero from "@/components/LandingHero";

// Sin esto, Next.js pre-renderiza esta pagina como estatica en el build y los
// cambios que el admin haga a la pelicula/funciones no se veran en el sitio
// hasta el siguiente deploy.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  await connectDB();

  const [pelicula, proximaFuncion] = await Promise.all([
    Pelicula.findOne({}),
    Funcion.findOne({ activa: true, cancelada: false }).sort({ fechaHora: 1 }),
  ]);

  return (
    <LandingHero
      titulo={pelicula?.titulo ?? "La Captura"}
      sinopsis={pelicula?.sinopsis ?? ""}
      posterUrl={pelicula?.posterUrl ?? ""}
      trailerYoutubeId={pelicula?.trailerYoutubeId ?? ""}
      proximaFuncionISO={proximaFuncion ? proximaFuncion.fechaHora.toISOString() : null}
    />
  );
}
