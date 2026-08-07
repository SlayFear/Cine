"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  targetISO: string;
}

interface TimeLeft {
  dias: number;
  horas: number;
  min: number;
  seg: number;
}

const UNITS: { key: keyof TimeLeft; label: string }[] = [
  { key: "dias", label: "Días" },
  { key: "horas", label: "Horas" },
  { key: "min", label: "Min" },
  { key: "seg", label: "Seg" },
];

function getTimeLeft(targetISO: string): TimeLeft {
  const diff = Math.max(0, new Date(targetISO).getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);

  return {
    dias: Math.floor(totalSeconds / 86400),
    horas: Math.floor((totalSeconds % 86400) / 3600),
    min: Math.floor((totalSeconds % 3600) / 60),
    seg: totalSeconds % 60,
  };
}

export default function Countdown({ targetISO }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft(targetISO));
    const interval = setInterval(() => setTimeLeft(getTimeLeft(targetISO)), 1000);
    return () => clearInterval(interval);
  }, [targetISO]);

  if (!timeLeft) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-cine-muted">
        La función exclusiva comienza en
      </p>
      <div className="flex gap-3">
        {UNITS.map(({ key, label }) => (
          <div
            key={key}
            className="flex min-w-[64px] flex-col items-center gap-1 rounded-md border border-cine-red/50 bg-cine-red/5 px-4 py-3"
          >
            <span className="text-3xl font-extrabold tabular-nums text-cine-red">
              {String(timeLeft[key]).padStart(2, "0")}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-muted">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
