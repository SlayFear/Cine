import { connectDB } from "@/lib/db";
import Funcion from "@/models/Funcion";
import Invitacion from "@/models/Invitacion";

export interface FuncionStats {
  _id: string;
  orden: number;
  fechaHora: Date;
  activa: boolean;
  cancelada: boolean;
  capacidad: number;
  disponibles: number;
  reservados: number;
  cancelados: number;
  checkedIn: number;
}

export async function getDashboardData(): Promise<FuncionStats[]> {
  await connectDB();

  const [funciones, statsAgg] = await Promise.all([
    Funcion.find({}).sort({ orden: 1 }),
    Invitacion.aggregate([
      {
        $group: {
          _id: { funcionId: "$funcionId", status: "$status" },
          count: { $sum: 1 },
          checkedIn: { $sum: { $cond: ["$checkedIn", 1, 0] } },
        },
      },
    ]),
  ]);

  const statsByFuncion = new Map<
    string,
    { disponibles: number; reservados: number; cancelados: number; checkedIn: number }
  >();

  for (const row of statsAgg) {
    const funcionId = row._id.funcionId.toString();
    const entry = statsByFuncion.get(funcionId) ?? {
      disponibles: 0,
      reservados: 0,
      cancelados: 0,
      checkedIn: 0,
    };

    if (row._id.status === "disponible") entry.disponibles += row.count;
    if (row._id.status === "reservado") entry.reservados += row.count;
    if (row._id.status === "cancelado") entry.cancelados += row.count;
    entry.checkedIn += row.checkedIn;

    statsByFuncion.set(funcionId, entry);
  }

  return funciones.map((f) => {
    const stats = statsByFuncion.get(f._id.toString()) ?? {
      disponibles: 0,
      reservados: 0,
      cancelados: 0,
      checkedIn: 0,
    };

    return {
      _id: f._id.toString(),
      orden: f.orden,
      fechaHora: f.fechaHora,
      activa: f.activa,
      cancelada: f.cancelada,
      capacidad: f.capacidad,
      ...stats,
    };
  });
}
