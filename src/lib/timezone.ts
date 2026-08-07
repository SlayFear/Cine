import { fromZonedTime, formatInTimeZone, toZonedTime } from "date-fns-tz";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const VENUE_TIMEZONE = "America/Chihuahua";

/**
 * Convierte un string "sin zona" (ej. del input datetime-local: "2026-08-05T19:00")
 * asumiendo que representa la hora local de la sala, a un Date UTC real para guardar en Mongo.
 */
export function venueLocalToUtc(naiveDatetime: string): Date {
  return fromZonedTime(naiveDatetime, VENUE_TIMEZONE);
}

export function formatVenueDateTime(date: Date | string): string {
  return formatInTimeZone(date, VENUE_TIMEZONE, "d 'de' MMMM yyyy, h:mm a", { locale: es });
}

export function formatVenueDate(date: Date | string): string {
  return formatInTimeZone(date, VENUE_TIMEZONE, "d 'de' MMMM yyyy", { locale: es });
}

export function formatVenueWeekday(date: Date | string): string {
  const weekday = formatInTimeZone(date, VENUE_TIMEZONE, "EEEE", { locale: es });
  return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}

export function formatVenueTime(date: Date | string): string {
  return formatInTimeZone(date, VENUE_TIMEZONE, "h:mm a", { locale: es });
}

/**
 * Formatea un Date UTC como el valor que espera un <input type="datetime-local">
 * (ej. "2026-08-05T19:00"), representando la hora local de la sala.
 */
export function utcToVenueLocalInputValue(date: Date | string): string {
  return format(toZonedTime(date, VENUE_TIMEZONE), "yyyy-MM-dd'T'HH:mm");
}
