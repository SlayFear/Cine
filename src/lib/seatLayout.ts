export type SeatBlock = "izquierda" | "derecha";

export interface SeatDefinition {
  id: string; // ej. "A1".."G13", "H1".."H8"
  rowLabel: string; // "A".."H"
  seatNumber: number; // 1-13 en filas A-G, 1-8 en fila H
  block?: SeatBlock; // solo definido en la fila H (a cada lado del hueco de la cabina)
}

const STRAIGHT_ROWS = ["A", "B", "C", "D", "E", "F", "G"];
const SEATS_PER_STRAIGHT_ROW = 13;
const LAST_ROW_LABEL = "H";
const LAST_ROW_HALF = 4; // 4 asientos + hueco (cabina de proyección) + 4 asientos

function buildSeatRows(): { rowLabel: string; seats: SeatDefinition[] }[] {
  const rows = STRAIGHT_ROWS.map((rowLabel) => ({
    rowLabel,
    seats: Array.from({ length: SEATS_PER_STRAIGHT_ROW }, (_, i) => ({
      id: `${rowLabel}${i + 1}`,
      rowLabel,
      seatNumber: i + 1,
    })),
  }));

  const lastRowSeats: SeatDefinition[] = [
    ...Array.from({ length: LAST_ROW_HALF }, (_, i) => ({
      id: `${LAST_ROW_LABEL}${i + 1}`,
      rowLabel: LAST_ROW_LABEL,
      seatNumber: i + 1,
      block: "izquierda" as const,
    })),
    ...Array.from({ length: LAST_ROW_HALF }, (_, i) => ({
      id: `${LAST_ROW_LABEL}${i + 1 + LAST_ROW_HALF}`,
      rowLabel: LAST_ROW_LABEL,
      seatNumber: i + 1 + LAST_ROW_HALF,
      block: "derecha" as const,
    })),
  ];

  rows.push({ rowLabel: LAST_ROW_LABEL, seats: lastRowSeats });
  return rows;
}

export const SEAT_ROWS = buildSeatRows();
export const ALL_SEATS: SeatDefinition[] = SEAT_ROWS.flatMap((r) => r.seats);
export const TOTAL_SEATS = ALL_SEATS.length;

if (TOTAL_SEATS !== 99) {
  throw new Error(
    `El layout de la sala debe tener 99 asientos, tiene ${TOTAL_SEATS}. Revisa src/lib/seatLayout.ts`
  );
}

export const SEAT_ID_SET = new Set(ALL_SEATS.map((s) => s.id));

export function isValidSeatId(seatId: string): boolean {
  return SEAT_ID_SET.has(seatId);
}

export function getSeatById(seatId: string): SeatDefinition | undefined {
  return ALL_SEATS.find((s) => s.id === seatId);
}

export const ROOM_LAYOUT_VERSION = "v1";
