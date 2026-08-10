import { notFound } from "next/navigation";
import { getConfirmacionData } from "@/lib/confirmacion";
import { formatVenueDateTime } from "@/lib/timezone";
import ConfirmacionCard from "@/components/ConfirmacionCard";

type PageProps = { params: Promise<{ codigo: string }> };

export default async function ConfirmacionPage({ params }: PageProps) {
  const { codigo } = await params;
  const data = await getConfirmacionData(codigo);

  if (!data) notFound();

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-10 text-neutral-100">
      <ConfirmacionCard
        peliculaTitulo={data.peliculaTitulo}
        funcionLabel={
          data.funcion
            ? `Funcion ${data.funcion.orden} · ${formatVenueDateTime(data.funcion.fechaHora)}`
            : null
        }
        seatId={data.seatId}
        codigo={data.codigo}
        qrDataUrl={data.qrDataUrl}
      />
    </main>
  );
}
