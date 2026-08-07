"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatVenueDate, formatVenueTime } from "@/lib/timezone";
import { EVENT_PRIVACY_NOTE, EVENT_VENUE_CITY, EVENT_VENUE_NAME } from "@/lib/eventConfig";
import {
  IconCalendar,
  IconChevronDown,
  IconClock,
  IconLock,
  IconMapPin,
  IconSeat,
  IconStar,
} from "@/components/landing/icons";
import FlowStepper from "@/components/booking/FlowStepper";
import ReservaConfirmadaModal from "@/components/booking/ReservaConfirmadaModal";

interface Seat {
  id: string;
  rowLabel: string;
  seatNumber: number;
  block?: "izquierda" | "derecha";
  ocupado: boolean;
}

interface SeatRow {
  rowLabel: string;
  seats: Seat[];
}

interface SeatSelectorProps {
  funcionId: string;
  titulo: string;
  posterUrl: string;
  fechaHoraISO: string;
}

// Cinta de acordonamiento policial: asientos ya reservados se marcan como "escena
// acordonada" en vez del rojo apagado genérico, para reforzar la temática de LA CAPTURA.
const RESERVED_TAPE_STYLE: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(45deg, rgba(250,204,21,0.7) 0px, rgba(250,204,21,0.7) 5px, rgba(10,10,10,0.92) 5px, rgba(10,10,10,0.92) 10px)",
};

// Al elegir asiento sale un emoji policial random en vez del número, como
// guiño divertido a la temática de LA CAPTURA.
const SELECTION_EMOJIS = ["👮", "🚨", "🚓", "🚔", "🕵️", "🔦"];

function InfoRow({
  icon: Icon,
  label,
  lines,
}: {
  icon: typeof IconCalendar;
  label: string;
  lines: string[];
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cine-red/40 bg-cine-red/10 text-cine-red">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] font-bold tracking-[0.25em] text-cine-muted">{label}</p>
        {lines.map((line) => (
          <p key={line} className="text-sm font-semibold text-cine-text">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function SeatSelector({ funcionId, titulo, posterUrl, fechaHoraISO }: SeatSelectorProps) {
  const router = useRouter();

  const [rows, setRows] = useState<SeatRow[] | null>(null);
  const [selected, setSelected] = useState<Seat | null>(null);
  const [selectionEmoji, setSelectionEmoji] = useState(SELECTION_EMOJIS[0]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<"asiento" | "confirmar">("asiento");
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [reservaConfirmada, setReservaConfirmada] = useState<{ codigo: string; seatId: string } | null>(
    null,
  );

  useEffect(() => {
    fetch(`/api/funciones/${funcionId}/asientos`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setError(data.error ?? "No se pudo cargar el mapa de asientos");
          return;
        }
        setRows(data.rows);
      })
      .catch(() => setError("No se pudo cargar el mapa de asientos"));
  }, [funcionId]);

  useEffect(() => {
    const prefillCodigo = sessionStorage.getItem(`cr_prefill_codigo_${funcionId}`);
    if (prefillCodigo) {
      setCodigo(prefillCodigo);
    }
  }, [funcionId]);

  function handleContinuar() {
    if (!selected) return;
    setConfirmError(null);
    setStep("confirmar");
  }

  function handleCambiarAsiento() {
    setConfirmError(null);
    setStep("asiento");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;

    setConfirmLoading(true);
    setConfirmError(null);

    const res = await fetch("/api/reservas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ funcionId, codigo, seatId: selected.id, guestName: nombre, guestEmail: email }),
    });
    const data = await res.json();
    setConfirmLoading(false);

    if (!res.ok || !data.ok) {
      setConfirmError(data.error ?? "No se pudo confirmar la reservacion");
      if (data.reason === "seat_taken") {
        setSelected(null);
        setStep("asiento");
        setRows((prev) =>
          prev?.map((row) => ({
            ...row,
            seats: row.seats.map((seat) => (seat.id === selected.id ? { ...seat, ocupado: true } : seat)),
          })) ?? prev,
        );
      }
      return;
    }

    sessionStorage.removeItem(`cr_prefill_codigo_${funcionId}`);
    setReservaConfirmada({ codigo: data.codigo, seatId: data.seatId });
  }

  return (
    <div className="min-h-screen bg-cine-bg text-cine-text">
      <div className="mx-auto max-w-[1440px] px-4 py-6 lg:px-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-lg font-bold tracking-[0.2em] text-cine-text">
            LA <span className="text-cine-red">CAPTURA</span>
          </Link>
          <FlowStepper current={step === "confirmar" ? 3 : 2} />
        </header>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col">
            <div className="mb-8">
              {step === "asiento" && (
                <Link
                  href="/funciones"
                  className="mb-4 inline-flex items-center gap-2 text-xs font-bold tracking-wider text-cine-muted transition hover:text-cine-text"
                >
                  ← Volver a funciones
                </Link>
              )}
              <h1 className="text-2xl font-bold tracking-tight text-cine-text sm:text-3xl">
                {step === "confirmar" ? "Confirma tu lugar" : "Elige tu asiento"}
              </h1>
              <p className="mt-1 text-sm text-cine-muted">
                {step === "confirmar"
                  ? "Ingresa tu código de invitación y tus datos para reservar el asiento."
                  : "Selecciona el asiento desde donde disfrutarás la función."}
              </p>
            </div>

            {step === "asiento" && (
              <div className="mx-auto mb-10 w-full max-w-3xl">
                <div
                  className="relative h-14 w-full overflow-hidden opacity-90 sm:h-16"
                  style={{
                    clipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)",
                    background:
                      "linear-gradient(to bottom, rgba(255,255,255,0.22), rgba(229,9,20,0.12), transparent)",
                  }}
                >
                  {/* Vidrio estrellado por un disparo: guiño policial sobre la
                      pantalla, no sobre los asientos. Trazos fijos (no random)
                      para que el markup no cambie entre servidor y cliente. */}
                  <svg
                    viewBox="0 0 800 100"
                    preserveAspectRatio="none"
                    className="absolute inset-0 h-full w-full"
                    aria-hidden="true"
                  >
                    <defs>
                      <radialGradient id="bulletGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                        <stop offset="35%" stopColor="rgba(255,255,255,0.22)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                      </radialGradient>
                    </defs>
                    <circle cx="300" cy="50" r="26" fill="url(#bulletGlow)" />
                    <g stroke="rgba(255,255,255,0.4)" strokeWidth="1.1" fill="none" strokeLinecap="round">
                      <path d="M300,50 L250,15 L210,5" />
                      <path d="M300,50 L340,10 L380,20" />
                      <path d="M300,50 L420,55 L500,40" />
                      <path d="M300,50 L450,80 L520,95" />
                      <path d="M300,50 L260,85 L300,98" />
                      <path d="M300,50 L180,70 L110,85" />
                      <path d="M300,50 L160,40 L60,55" />
                      <path d="M300,50 L330,75 L370,90" />
                    </g>
                    <circle cx="300" cy="50" r="5" fill="rgba(10,10,10,0.85)" />
                    <circle cx="300" cy="50" r="7.5" fill="none" stroke="rgba(229,9,20,0.65)" strokeWidth="1.4" />
                  </svg>
                </div>
                <p className="mt-3 text-center text-[11px] font-bold tracking-[0.5em] text-cine-muted">
                  PANTALLA
                </p>
              </div>
            )}

            {step === "asiento" && error && (
              <div className="space-y-3 py-16 text-center">
                <p className="text-cine-red">{error}</p>
                <Link href="/funciones" className="text-sm text-cine-muted underline">
                  Elegir otra función
                </Link>
              </div>
            )}

            {step === "asiento" && !rows && !error && (
              <p className="py-16 text-center text-sm text-cine-muted">Cargando mapa de asientos...</p>
            )}

            {step === "asiento" && rows && (
              <>
                <div className="mb-4 flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-[0.3em] text-cine-muted">
                  <IconChevronDown className="h-3 w-3 rotate-180" />
                  FRENTE
                </div>

                <div className="space-y-2 overflow-x-auto pb-2">
                  {rows.map((row) => (
                    <div key={row.rowLabel}>
                      <div className="flex w-max min-w-full items-center justify-center gap-1.5">
                        <span className="w-5 shrink-0 text-center text-xs font-bold text-cine-muted">
                          {row.rowLabel}
                        </span>
                        <div className="flex gap-1.5">
                          {row.seats.map((seat, idx) => {
                            const prevSeat = row.seats[idx - 1];
                            const showGap =
                              prevSeat && prevSeat.block === "izquierda" && seat.block === "derecha";
                            const isSelected = selected?.id === seat.id;
                            const isHovered = hovered === seat.id;

                            return (
                              <div key={seat.id} className="flex items-center gap-1.5">
                                {showGap && <div className="w-4" />}
                                <div className="relative">
                                  {isHovered && (
                                    <div className="pointer-events-none absolute -top-[3.6rem] left-1/2 z-20 -translate-x-1/2 rounded-lg border border-cine-border bg-[#141414] px-3 py-2 text-center whitespace-nowrap shadow-xl">
                                      <p className="text-xs font-bold text-cine-text">
                                        {seat.rowLabel}-{seat.seatNumber}
                                      </p>
                                      <p className="mt-0.5 flex items-center justify-center gap-1.5 text-[10px] text-cine-muted">
                                        {seat.ocupado ? (
                                          <span
                                            className="h-1.5 w-2.5 rounded-[1px] border border-yellow-500/40"
                                            style={RESERVED_TAPE_STYLE}
                                          />
                                        ) : (
                                          <span
                                            className={`h-1.5 w-1.5 rounded-full ${
                                              isSelected ? "bg-cine-red" : "bg-emerald-400"
                                            }`}
                                          />
                                        )}
                                        {seat.ocupado
                                          ? "Reservado"
                                          : isSelected
                                            ? "Tu selección"
                                            : "Disponible"}
                                      </p>
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    disabled={seat.ocupado}
                                    onClick={() => {
                                      setSelected(seat);
                                      setSelectionEmoji(
                                        SELECTION_EMOJIS[Math.floor(Math.random() * SELECTION_EMOJIS.length)],
                                      );
                                    }}
                                    onMouseEnter={() => setHovered(seat.id)}
                                    onMouseLeave={() => setHovered(null)}
                                    aria-label={`${seat.rowLabel}-${seat.seatNumber}${seat.ocupado ? " (reservado)" : ""}`}
                                    style={seat.ocupado ? RESERVED_TAPE_STYLE : undefined}
                                    className={`h-7 w-7 rounded-md border font-semibold transition-all duration-150 sm:h-8 sm:w-8 ${
                                      seat.ocupado
                                        ? "cursor-not-allowed border-yellow-500/30 text-[10px] text-transparent opacity-60"
                                        : isSelected
                                          ? "border-cine-red bg-cine-red text-sm text-cine-text shadow-[0_0_16px_-2px_rgba(229,9,20,0.9)] sm:text-base"
                                          : "seat-siren bg-white/[0.06] text-[10px] text-cine-muted hover:bg-white/10 hover:text-cine-text"
                                    }`}
                                  >
                                    {isSelected ? (
                                      <span aria-hidden="true">{selectionEmoji}</span>
                                    ) : (
                                      seat.seatNumber
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-[0.3em] text-cine-muted">
                  FONDO
                  <IconChevronDown className="h-3 w-3" />
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-cine-muted">
                  <span className="flex items-center gap-2">
                    <IconSeat className="h-4 w-4 text-cine-muted" /> Disponible
                  </span>
                  <span className="flex items-center gap-2">
                    <IconSeat className="h-4 w-4 text-cine-red" /> Tu selección
                  </span>
                  <span className="flex items-center gap-2">
                    <span
                      className="h-4 w-4 rounded-sm border border-yellow-500/40"
                      style={RESERVED_TAPE_STYLE}
                    />
                    Reservado
                  </span>
                </div>

                <div className="sticky bottom-4 mt-10 flex flex-col gap-4 rounded-xl border border-cine-border bg-cine-bg/95 p-5 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cine-red/40 bg-cine-red/10 text-cine-red">
                      <IconSeat className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.2em] text-cine-muted">
                        ASIENTO SELECCIONADO
                      </p>
                      <p className="text-sm font-bold text-cine-text">
                        {selected ? `Fila ${selected.rowLabel}, Asiento ${selected.seatNumber}` : "Selecciona un asiento"}
                      </p>
                    </div>
                  </div>

                  <p className="flex items-center gap-2 text-xs text-cine-muted">
                    <IconLock className="h-3.5 w-3.5 shrink-0" />
                    Tu lugar se reserva al confirmar tu invitación.
                  </p>

                  <button
                    type="button"
                    onClick={handleContinuar}
                    disabled={!selected}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-cine-red px-6 py-3 text-sm font-bold tracking-wider text-cine-text transition hover:scale-[1.02] hover:shadow-[0_0_30px_-6px_rgba(229,9,20,0.85)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none"
                  >
                    Confirmar asiento →
                  </button>
                </div>
              </>
            )}

            {step === "confirmar" && selected && (
              <form onSubmit={handleSubmit} className="mx-auto w-full max-w-sm space-y-4">
                <div className="flex items-center gap-3 rounded-xl border border-cine-border bg-white/[0.03] p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cine-red/40 bg-cine-red/10 text-cine-red">
                    <IconSeat className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.2em] text-cine-muted">
                      ASIENTO SELECCIONADO
                    </p>
                    <p className="text-sm font-bold text-cine-text">
                      Fila {selected.rowLabel}, Asiento {selected.seatNumber}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-cine-muted">Código de invitación</label>
                  <input
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    required
                    placeholder="AB3D-K92Q"
                    className="w-full rounded-md border border-cine-border bg-white/[0.03] px-3 py-2 text-center font-mono uppercase tracking-widest text-cine-text outline-none focus:border-cine-red"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-cine-muted">Nombre completo</label>
                  <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="w-full rounded-md border border-cine-border bg-white/[0.03] px-3 py-2 text-cine-text outline-none focus:border-cine-red"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-cine-muted">Correo electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-md border border-cine-border bg-white/[0.03] px-3 py-2 text-cine-text outline-none focus:border-cine-red"
                  />
                  <p className="text-xs text-cine-muted">Aquí te enviaremos tu QR de acceso</p>
                </div>

                {confirmError && <p className="text-sm text-cine-red">{confirmError}</p>}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCambiarAsiento}
                    className="text-sm text-cine-muted underline"
                  >
                    Cambiar asiento
                  </button>
                  <button
                    type="submit"
                    disabled={confirmLoading}
                    className="ml-auto inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-cine-red px-6 py-3 text-sm font-bold tracking-wider text-cine-text transition hover:scale-[1.02] hover:shadow-[0_0_30px_-6px_rgba(229,9,20,0.85)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none"
                  >
                    {confirmLoading ? "Confirmando..." : "Confirmar →"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="relative aspect-2/3 w-full overflow-hidden rounded-xl border border-cine-border">
              <Image src={posterUrl} alt={titulo} fill sizes="320px" className="object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-cine-bg via-transparent to-transparent" />
            </div>

            <div className="mt-6 space-y-5">
              <InfoRow icon={IconCalendar} label="FECHA" lines={[formatVenueDate(fechaHoraISO)]} />
              <InfoRow icon={IconClock} label="HORA" lines={[formatVenueTime(fechaHoraISO)]} />
              <InfoRow icon={IconMapPin} label="LUGAR" lines={[EVENT_VENUE_NAME, EVENT_VENUE_CITY]} />
              <InfoRow icon={IconStar} label="EVENTO" lines={[EVENT_PRIVACY_NOTE]} />
            </div>
          </aside>
        </div>
      </div>

      {reservaConfirmada && (
        <ReservaConfirmadaModal
          peliculaTitulo={titulo}
          funcionLabel={`${formatVenueDate(fechaHoraISO)} · ${formatVenueTime(fechaHoraISO)}`}
          seatId={reservaConfirmada.seatId}
          onVolverInicio={() => router.push("/")}
        />
      )}
    </div>
  );
}
