"use client";

import { motion, AnimatePresence } from "framer-motion";
import { IconUserCheck } from "@/components/landing/icons";

interface ReservaConfirmadaModalProps {
  peliculaTitulo: string;
  funcionLabel: string;
  seatId: string;
  codigo: string;
  qrDataUrl: string | null;
  emailEnviado: boolean;
  onVolverInicio: () => void;
}

export default function ReservaConfirmadaModal({
  peliculaTitulo,
  funcionLabel,
  seatId,
  codigo,
  qrDataUrl,
  emailEnviado,
  onVolverInicio,
}: ReservaConfirmadaModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          className="w-full max-w-sm space-y-6 rounded-xl border border-cine-border bg-cine-bg p-8 text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cine-red/40 bg-cine-red/10 text-cine-red">
            <IconUserCheck className="h-7 w-7" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-cine-red">Lugar confirmado</h2>
            <p className="text-cine-text">{peliculaTitulo}</p>
            <p className="text-sm text-cine-muted">{funcionLabel}</p>
          </div>

          <p className="text-lg">
            Asiento <span className="font-mono font-semibold">{seatId}</span>
          </p>

          {qrDataUrl && (
            <div className="mx-auto w-fit rounded-lg border-4 border-white bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="Código QR de tu pase" className="h-40 w-40" />
            </div>
          )}

          <p className="text-xs text-cine-muted">
            {emailEnviado
              ? "Te enviamos tu pase con código QR por correo electrónico. Presentalo en taquilla el día de la función."
              : "No pudimos confirmar el envío del correo. Descarga tu QR aquí y presentalo en taquilla el día de la función."}
          </p>

          {qrDataUrl && (
            <a
              href={qrDataUrl}
              download={`pase-cinerejon-${codigo}.png`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-cine-border px-6 py-3 text-sm font-bold tracking-wider text-cine-text transition hover:border-cine-red/50 hover:bg-white/[0.04]"
            >
              Descargar QR
            </a>
          )}

          <button
            type="button"
            onClick={onVolverInicio}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-cine-red px-6 py-3 text-sm font-bold tracking-wider text-cine-text transition hover:scale-[1.02] hover:shadow-[0_0_30px_-6px_rgba(229,9,20,0.85)]"
          >
            Volver al inicio
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
