export const SCHEDULE_MIN_DELAY_MS = 4 * 60 * 60 * 1000;
export const SCHEDULE_MAX_DELAY_MS = 7 * 24 * 60 * 60 * 1000;

export type ScheduleTimeError = "invalid" | "too-early" | "too-late" | null;

export function validateScheduleTime(value: string | number | Date, now = Date.now()): ScheduleTimeError {
  const timestamp = value instanceof Date
    ? value.getTime()
    : typeof value === "number"
      ? value
      : Date.parse(value);
  if (Number.isNaN(timestamp)) return "invalid";
  if (timestamp < now + SCHEDULE_MIN_DELAY_MS) return "too-early";
  if (timestamp > now + SCHEDULE_MAX_DELAY_MS) return "too-late";
  return null;
}
