"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { downloadTicketImage } from "@/lib/ticketImage";

interface ConfirmacionCardProps {
  peliculaTitulo: string;
  funcionLabel: string | null;
  seatId: string | null;
  codigo: string;
  qrDataUrl: string;
  posterUrl: string;
}

export default function ConfirmacionCard({
  peliculaTitulo,
  funcionLabel,
  seatId,
  codigo,
  qrDataUrl,
  posterUrl,
}: ConfirmacionCardProps) {
  const [descargando, setDescargando] = useState(false);

  async function handleDescargar() {
    if (descargando) return;
    setDescargando(true);
    try {
      await downloadTicketImage({
        peliculaTitulo,
        funcionLabel: funcionLabel ?? "",
        seatId,
        codigo,
        qrDataUrl,
        posterUrl,
      });
    } finally {
      setDescargando(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-sm space-y-6 rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-center"
    >
      <motion.h1
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-semibold text-red-500"
      >
        Lugar confirmado
      </motion.h1>

      <p className="text-neutral-300">{peliculaTitulo}</p>
      {funcionLabel && <p className="text-sm text-neutral-400">{funcionLabel}</p>}

      <p className="text-lg">
        Asiento <span className="font-mono font-semibold">{seatId}</span>
      </p>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="mx-auto w-fit rounded-lg border-4 border-white bg-white"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="Código QR de tu pase" className="h-40 w-40" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="text-sm text-neutral-400"
      >
        Presentalo en taquilla el dia de la funcion.
      </motion.p>

      <button
        type="button"
        onClick={handleDescargar}
        disabled={descargando}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-neutral-700 px-6 py-3 text-sm font-bold tracking-wider text-neutral-100 transition hover:border-red-500/50 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {descargando ? "Generando..." : "Descargar pase"}
      </button>
    </motion.div>
  );
}
