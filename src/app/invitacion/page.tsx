"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Punto de entrada solo para invitaciones ya impresas/emitidas (QR o link con
 * ?code=...): busca a que funcion pertenece el codigo, lo deja pre-cargado
 * para el paso de confirmar, y manda derecho al mapa de asientos. El flujo
 * normal (landing -> elegir funcion -> elegir asiento -> ahi se pide el
 * codigo) no pasa por aqui.
 */
function InvitacionRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const codigo = searchParams.get("code");
    if (!codigo) {
      router.replace("/");
      return;
    }

    fetch("/api/invitaciones/validar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setError(data.error ?? "No se pudo validar el codigo");
          return;
        }
        sessionStorage.setItem(`cr_prefill_codigo_${data.funcion._id}`, data.codigo);
        router.replace(`/funcion/${data.funcion._id}/seleccionar-asiento`);
      })
      .catch(() => setError("No se pudo validar el codigo"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-red-500">{error}</p>
        <Link href="/" className="text-sm text-neutral-400 underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return <p className="text-neutral-500">Validando tu invitacion...</p>;
}

export default function InvitacionPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <Suspense>
        <InvitacionRedirect />
      </Suspense>
    </main>
  );
}
