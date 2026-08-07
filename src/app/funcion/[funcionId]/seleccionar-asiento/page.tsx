import Link from "next/link";
import { connectDB } from "@/lib/db";
import Funcion from "@/models/Funcion";
import Pelicula from "@/models/Pelicula";
import { EVENT_FALLBACK_POSTER } from "@/lib/eventConfig";
import SeatSelector from "@/components/booking/SeatSelector";

export const dynamic = "force-dynamic";

type PageParams = { params: Promise<{ funcionId: string }> };

export default async function SeleccionarAsientoPage({ params }: PageParams) {
  const { funcionId } = await params;

  await connectDB();

  const [funcion, pelicula] = await Promise.all([
    Funcion.findById(funcionId).catch(() => null),
    Pelicula.findOne({}),
  ]);

  if (!funcion || !funcion.activa || funcion.cancelada) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cine-bg px-4 text-center">
        <div className="space-y-3">
          <p className="text-cine-red">Esta función ya no está disponible.</p>
          <Link href="/funciones" className="text-sm text-cine-muted underline">
            Elegir otra función
          </Link>
        </div>
      </main>
    );
  }

  return (
    <SeatSelector
      funcionId={funcionId}
      titulo={pelicula?.titulo ?? "La Captura"}
      posterUrl={pelicula?.posterUrl || EVENT_FALLBACK_POSTER}
      fechaHoraISO={funcion.fechaHora.toISOString()}
    />
  );
}
