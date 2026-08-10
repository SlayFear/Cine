import Image from "next/image";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Funcion from "@/models/Funcion";
import Invitacion from "@/models/Invitacion";
import Pelicula from "@/models/Pelicula";
import { formatVenueDate, formatVenueTime, formatVenueWeekday } from "@/lib/timezone";
import {
  EVENT_FALLBACK_POSTER,
  EVENT_SUBTITLE,
  EVENT_TAGLINE,
  EVENT_VENUE_CITY,
  EVENT_VENUE_NAME,
} from "@/lib/eventConfig";
import { IconCalendar, IconClock, IconFilm, IconLock, IconMapPin, IconSeat } from "@/components/landing/icons";
import FlowStepper from "@/components/booking/FlowStepper";

// Igual que la landing: sin esto Next.js cachea la lista y una funcion nueva,
// cancelada o con nuevas reservas por el admin no se refleja hasta el
// siguiente deploy.
export const dynamic = "force-dynamic";

function disponibilidad(reservados: number, capacidad: number) {
  const ratio = capacidad > 0 ? reservados / capacidad : 1;
  if (ratio >= 1) return { label: "Agotada", tone: "text-cine-red", soldOut: true };
  if (ratio < 0.5) return { label: "Disponibilidad alta", tone: "text-emerald-400", soldOut: false };
  if (ratio < 0.85) return { label: "Disponibilidad media", tone: "text-amber-400", soldOut: false };
  return { label: "Disponibilidad baja", tone: "text-cine-red", soldOut: false };
}

export default async function FuncionesPage() {
  await connectDB();

  const [pelicula, funciones] = await Promise.all([
    Pelicula.findOne({}),
    Funcion.find({ activa: true, cancelada: false }).sort({ fechaHora: 1 }),
  ]);

  const reservasPorFuncion = funciones.length
    ? await Invitacion.aggregate([
        { $match: { status: "reservado", funcionId: { $in: funciones.map((f) => f._id) } } },
        { $group: { _id: "$funcionId", count: { $sum: 1 } } },
      ])
    : [];
  const reservasMap = new Map<string, number>(
    reservasPorFuncion.map((r) => [r._id.toString(), r.count as number])
  );

  const titulo = pelicula?.titulo ?? "La Captura";
  const posterUrl = pelicula?.posterUrl || EVENT_FALLBACK_POSTER;
  const primeraFecha = funciones[0]?.fechaHora ?? null;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-cine-bg">
      <div className="absolute inset-y-0 left-0 hidden w-[42%] lg:block">
        <Image src={posterUrl} alt={titulo} fill sizes="42vw" className="object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-t from-cine-bg via-cine-bg/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-cine-bg" />
        {/* Backing solid enough that the poster's own baked-in title art
            never shows through the text block anchored to this panel's
            bottom edge. */}
        <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-cine-bg from-35% via-cine-bg/95 via-65% to-transparent" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex flex-wrap items-center justify-end gap-4 px-6 py-6 lg:px-10">
          <div className="flex items-center gap-6">
            <span className="hidden items-center gap-2 text-xs font-bold tracking-[0.2em] text-cine-muted sm:flex">
              FUNCIÓN EXCLUSIVA <span className="h-1.5 w-1.5 rounded-full bg-cine-red" />
            </span>
            <FlowStepper current={1} />
          </div>
        </header>

        <div className="grid flex-1 grid-cols-1 lg:grid-cols-[42%_1fr]">
          <div className="hidden flex-col justify-end px-10 pb-16 lg:flex">
            <span className="mb-4 inline-block w-fit rounded-sm bg-cine-red/15 px-3 py-1 text-xs font-bold tracking-[0.2em] text-cine-red">
              FUNCIÓN EXCLUSIVA
            </span>
            <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight text-cine-text">
              <Image
                src="/img/LogoCaptura.png"
                alt={titulo}
                width={475}
                height={100}
                className="h-14 w-auto object-contain"
              />
            </h1>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.25em] text-cine-muted">
              {EVENT_SUBTITLE}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-cine-muted">{EVENT_TAGLINE}</p>

            <div className="mt-7 space-y-3">
              {primeraFecha && (
                <div className="flex items-center gap-2 text-sm text-cine-text">
                  <IconCalendar className="h-4 w-4 shrink-0 text-cine-red" />
                  <span>{formatVenueDate(primeraFecha)}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-cine-text">
                <IconMapPin className="h-4 w-4 shrink-0 text-cine-red" />
                <span>
                  {EVENT_VENUE_NAME}, {EVENT_VENUE_CITY}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center px-6 py-10 lg:px-14 lg:py-16">
            <div className="mx-auto w-full max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight text-cine-text">Elige tu función</h2>
              <p className="mt-2 text-sm text-cine-muted">
                Selecciona la función a la que asistirás para continuar.
              </p>

              {funciones.length === 0 ? (
                <div className="mt-10 space-y-3 rounded-xl border border-cine-border bg-white/[0.02] p-8 text-center">
                  <p className="text-sm text-cine-muted">Aún no hay funciones disponibles.</p>
                  <Link href="/" className="text-sm font-semibold text-cine-red hover:underline">
                    Volver al inicio
                  </Link>
                </div>
              ) : (
                <div className="mt-8 space-y-3">
                  {funciones.map((funcion) => {
                    const reservados = reservasMap.get(funcion._id.toString()) ?? 0;
                    const { label, tone, soldOut } = disponibilidad(reservados, funcion.capacidad);
                    const numero = String(funcion.orden).padStart(2, "0");

                    const inner = (
                      <>
                        <div className="flex items-center gap-4 sm:gap-5">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-cine-red/50 bg-cine-red/10 text-cine-red">
                            <IconFilm className="h-6 w-6" />
                          </div>
                          <div className="shrink-0">
                            <p className="text-[10px] font-bold tracking-[0.25em] text-cine-muted">
                              FUNCIÓN
                            </p>
                            <p className="text-2xl leading-none font-extrabold text-cine-text">{numero}</p>
                          </div>
                          <div className="hidden h-10 w-px bg-cine-border sm:block" />
                          <div className="min-w-0">
                            <p className="text-sm font-bold tracking-wide text-cine-text uppercase">
                              {formatVenueWeekday(funcion.fechaHora)}
                            </p>
                            <p className="text-sm text-cine-muted">{formatVenueDate(funcion.fechaHora)}</p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                              <span className="flex items-center gap-1.5 text-cine-muted">
                                <IconClock className="h-3.5 w-3.5 text-cine-red" />
                                {formatVenueTime(funcion.fechaHora)}
                              </span>
                              <span className={`flex items-center gap-1.5 font-semibold ${tone}`}>
                                <IconSeat className="h-3.5 w-3.5" />
                                {label}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 rounded-md px-2.5 py-1 text-sm font-bold backdrop-blur-sm ${
                            soldOut ? "text-cine-muted" : "bg-cine-bg/70 text-cine-red"
                          }`}
                        >
                          {soldOut ? "Agotada" : "Elegir función →"}
                        </span>
                      </>
                    );

                    const cardBackground = (
                      <>
                        <Image
                          src="/img/Funciones.png"
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 576px, 100vw"
                          className="absolute inset-0 -z-10 object-cover object-[100%_38%] opacity-60 transition-opacity duration-300 group-hover:opacity-80"
                        />
                        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cine-bg from-40% via-cine-bg/75 via-60% to-transparent" />
                      </>
                    );

                    if (soldOut) {
                      return (
                        <div
                          key={funcion._id.toString()}
                          className="group relative isolate flex cursor-not-allowed flex-col gap-4 overflow-hidden rounded-xl border border-cine-border px-5 py-4 opacity-60 sm:flex-row sm:items-center sm:justify-between"
                        >
                          {cardBackground}
                          {inner}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={funcion._id.toString()}
                        href={`/funcion/${funcion._id.toString()}/seleccionar-asiento`}
                        className="group relative isolate flex flex-col gap-4 overflow-hidden rounded-xl border border-cine-border px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-cine-red/60 hover:shadow-[0_0_35px_-12px_rgba(229,9,20,0.5)] sm:flex-row sm:items-center sm:justify-between"
                      >
                        {cardBackground}
                        {inner}
                      </Link>
                    );
                  })}
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-cine-border pt-6">
                <p className="flex items-center gap-2 text-xs text-cine-muted">
                  <IconLock className="h-3.5 w-3.5 text-cine-muted" />
                  Acceso únicamente mediante serial de invitación.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-md border border-cine-border px-4 py-2.5 text-xs font-bold tracking-wider text-cine-text transition hover:border-cine-red/60"
                >
                  ← Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
