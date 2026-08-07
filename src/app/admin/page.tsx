import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";
import { formatVenueDateTime } from "@/lib/timezone";

export default async function AdminDashboardPage() {
  const [session, funciones] = await Promise.all([getAdminSession(), getDashboardData()]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-neutral-400">Sesion activa: {session?.email}</p>

      {funciones.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Aun no hay funciones.{" "}
          <Link href="/admin/funciones" className="underline">
            Crea la primera
          </Link>
          .
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {funciones.map((f) => (
            <div
              key={f._id}
              className="space-y-3 rounded-md border border-neutral-800 bg-neutral-900 p-5 hover:border-neutral-700"
            >
              <Link href={`/admin/funciones/${f._id}`} className="block space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Funcion {f.orden}</p>
                  {f.cancelada && (
                    <span className="rounded bg-red-900 px-2 py-0.5 text-xs">Cancelada</span>
                  )}
                </div>
                <p className="text-sm text-neutral-400">{formatVenueDateTime(f.fechaHora)}</p>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <p className="text-lg font-semibold">{f.capacidad}</p>
                    <p className="text-neutral-500">Aforo</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-green-500">{f.reservados}</p>
                    <p className="text-neutral-500">Reservados</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-neutral-300">{f.disponibles}</p>
                    <p className="text-neutral-500">Sin usar</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-blue-400">{f.checkedIn}</p>
                    <p className="text-neutral-500">En sala</p>
                  </div>
                </div>
              </Link>

              <Link
                href={`/admin/funciones/${f._id}/serials`}
                className="block rounded-md border border-neutral-700 px-3 py-1.5 text-center text-xs text-neutral-300 hover:border-neutral-500 hover:text-white"
              >
                Ver seriales
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
