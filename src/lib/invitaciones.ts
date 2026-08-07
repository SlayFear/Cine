import Invitacion, { type InvitacionDoc } from "@/models/Invitacion";
import { generateSerialCode } from "@/lib/serial";

export async function createInvitaciones(
  funcionId: string,
  bloqueId: string,
  cantidad: number
): Promise<InvitacionDoc[]> {
  const created: InvitacionDoc[] = [];

  for (let i = 0; i < cantidad; i++) {
    // Reintenta si por una coincidencia extremadamente improbable el codigo ya existe.
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const invitacion = await Invitacion.create({
          codigo: generateSerialCode(),
          funcionId,
          bloqueId,
        });
        created.push(invitacion);
        break;
      } catch (err) {
        const isDuplicateCodigo =
          typeof err === "object" &&
          err !== null &&
          "code" in err &&
          (err as { code?: number }).code === 11000;
        if (!isDuplicateCodigo || attempt === 4) throw err;
      }
    }
  }

  return created;
}
