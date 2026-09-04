import { describe, expect, it } from "vitest";
import {
  SCHEDULE_MAX_DELAY_MS,
  SCHEDULE_MIN_DELAY_MS,
  validateScheduleTime,
} from "./schedule";

describe("scheduled publishing window", () => {
  const now = Date.UTC(2026, 8, 4, 8, 0, 0);

  it("accepts the inclusive four-hour to seven-day window", () => {
    expect(validateScheduleTime(now + SCHEDULE_MIN_DELAY_MS, now)).toBeNull();
    expect(validateScheduleTime(now + SCHEDULE_MAX_DELAY_MS, now)).toBeNull();
  });

  it("rejects invalid, early, and overly distant times", () => {
    expect(validateScheduleTime("not-a-date", now)).toBe("invalid");
    expect(validateScheduleTime(now + SCHEDULE_MIN_DELAY_MS - 1, now)).toBe("too-early");
    expect(validateScheduleTime(now + SCHEDULE_MAX_DELAY_MS + 1, now)).toBe("too-late");
  });
});
