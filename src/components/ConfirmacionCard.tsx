"use client";

import { motion } from "framer-motion";

interface ConfirmacionCardProps {
  peliculaTitulo: string;
  funcionLabel: string | null;
  seatId: string | null;
}

export default function ConfirmacionCard({
  peliculaTitulo,
  funcionLabel,
  seatId,
}: ConfirmacionCardProps) {
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

      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="text-sm text-neutral-400"
      >
        Te enviamos tu pase con codigo QR por correo electronico. Presentalo en taquilla el dia de la funcion.
      </motion.p>
    </motion.div>
  );
}
