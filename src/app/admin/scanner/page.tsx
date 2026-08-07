"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { extractCodeFromScan } from "@/lib/serial";
import { formatVenueDateTime } from "@/lib/timezone";

const SCANNER_ELEMENT_ID = "qr-scanner-view";

interface LookupResult {
  codigo: string;
  guestName: string;
  seatId: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  peliculaTitulo: string;
  funcion: { orden: number; fechaHora: string } | null;
}

export default function ScannerPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanningRef = useRef(false);
  const taskRef = useRef<Promise<void>>(Promise.resolve());

  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [justConfirmed, setJustConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // React Strict Mode monta este efecto dos veces en desarrollo (mount ->
    // cleanup -> mount). html5-qrcode no tolera dos instancias arrancando a
    // la vez sobre el mismo contenedor (la camara se ve en vivo pero el
    // decoder que realmente corre queda huerfano y nunca detecta nada).
    // Encadenar todo sobre el ref persiste entre los dos montajes y obliga a
    // que el segundo arranque espere a que el primero termine de apagarse.
    taskRef.current = taskRef.current
      .catch(() => {})
      .then(async () => {
        if (cancelled) return;

        const html5QrCode = new Html5Qrcode(SCANNER_ELEMENT_ID);
        scannerRef.current = html5QrCode;

        try {
          await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (decodedText) => {
              if (scanningRef.current) return;
              scanningRef.current = true;
              void handleLookup(extractCodeFromScan(decodedText));
            },
            () => {
              // Ignora errores por frame (normal mientras no hay QR en cuadro).
            }
          );
        } catch {
          if (!cancelled) setError("No se pudo acceder a la camara. Usa el codigo manual.");
          return;
        }

        if (cancelled) {
          await html5QrCode.stop().catch(() => {});
          html5QrCode.clear();
        }
      });

    return () => {
      cancelled = true;
      taskRef.current = taskRef.current.then(async () => {
        const html5QrCode = scannerRef.current;
        if (html5QrCode?.getState() === Html5QrcodeScannerState.SCANNING) {
          await html5QrCode.stop().catch(() => {});
          html5QrCode.clear();
        }
      });
    };
  }, []);

  async function handleLookup(codigo: string) {
    setError(null);
    setResult(null);
    setAlreadyCheckedIn(false);
    setJustConfirmed(false);

    const res = await fetch(`/api/admin/checkin/lookup?codigo=${encodeURIComponent(codigo)}`);
    const data = await res.json();

    if (!res.ok || !data.ok) {
      setError(data.error ?? "No se pudo buscar el codigo");
      scanningRef.current = false;
      return;
    }

    setResult(data);
    setAlreadyCheckedIn(data.checkedIn);
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualCode.trim()) return;
    await handleLookup(manualCode);
  }

  async function handleConfirm() {
    if (!result) return;
    setConfirming(true);

    const res = await fetch("/api/admin/checkin/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo: result.codigo }),
    });
    const data = await res.json();
    setConfirming(false);

    if (!res.ok || !data.ok) {
      setError(data.error ?? "No se pudo confirmar la entrada");
      return;
    }

    if (data.alreadyCheckedIn) {
      setAlreadyCheckedIn(true);
    } else {
      setJustConfirmed(true);
    }
  }

  function handleScanNext() {
    setResult(null);
    setError(null);
    setManualCode("");
    scanningRef.current = false;
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-semibold">Escaner de taquilla</h1>

      <div
        id={SCANNER_ELEMENT_ID}
        className="overflow-hidden rounded-md border border-neutral-800 bg-black"
      />

      <form onSubmit={handleManualSubmit} className="flex gap-2">
        <input
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          placeholder="Codigo manual (AB3D-K92Q)"
          className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono uppercase"
        />
        <button
          type="submit"
          className="rounded-md border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-900"
        >
          Buscar
        </button>
      </form>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {result && (
        <div className="space-y-3 rounded-md border border-neutral-800 bg-neutral-900 p-5">
          <p className="font-medium">{result.peliculaTitulo}</p>
          {result.funcion && (
            <p className="text-sm text-neutral-400">
              Funcion {result.funcion.orden} · {formatVenueDateTime(result.funcion.fechaHora)}
            </p>
          )}
          <p>
            {result.guestName} · Asiento <span className="font-mono">{result.seatId}</span>
          </p>

          {justConfirmed && (
            <p className="rounded bg-green-900 px-3 py-2 text-sm text-green-200">
              Entrada confirmada
            </p>
          )}
          {alreadyCheckedIn && !justConfirmed && (
            <p className="rounded bg-amber-900 px-3 py-2 text-sm text-amber-200">
              Este codigo ya habia registrado entrada
              {result.checkedInAt ? ` (${new Date(result.checkedInAt).toLocaleTimeString("es-MX")})` : ""}
            </p>
          )}

          <div className="flex gap-2">
            {!alreadyCheckedIn && !justConfirmed && (
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="flex-1 rounded-md bg-red-700 py-2 font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                {confirming ? "Confirmando..." : "Confirmar entrada"}
              </button>
            )}
            <button
              onClick={handleScanNext}
              className="flex-1 rounded-md border border-neutral-700 py-2 text-sm hover:bg-neutral-800"
            >
              Escanear siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
