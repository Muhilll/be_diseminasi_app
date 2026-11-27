import { describe, expect, test } from "bun:test";
import {
  calculateDistanceMeters,
  computeCheckInStatus,
  computeCheckOutSubmissionStatus,
  computeEffectiveCheckOutStatus,
  getLocalDateParts,
  isOvernightShift,
  shiftDateString,
} from "./attendance";

describe("attendance utilities", () => {
  test("calculateDistanceMeters returns ~0 for identical coordinates and ~111m for 0.001 deg lat", () => {
    expect(calculateDistanceMeters(-5.147665, 119.432732, -5.147665, 119.432732)).toBe(0);
    const dist = calculateDistanceMeters(-5.147665, 119.432732, -5.148665, 119.432732);
    expect(dist).toBeGreaterThan(105);
    expect(dist).toBeLessThan(118);
  });

  test("getLocalDateParts formats date, HH:mm, and dayOfWeek in Asia/Makassar", () => {
    // 2026-11-29 12:30:00Z = 2026-11-29 20:30 WITA (Sunday = 0)
    const parts = getLocalDateParts(new Date("2026-11-29T12:30:00.000Z"), "Asia/Makassar");
    expect(parts.date).toBe("2026-11-29");
    expect(parts.time).toBe("20:30");
    expect(parts.dayOfWeek).toBe(0);
  });

  test("shiftDateString shifts YYYY-MM-DD by delta days", () => {
    expect(shiftDateString("2026-11-30", 1)).toBe("2026-12-01");
    expect(shiftDateString("2026-11-30", -1)).toBe("2026-11-29");
  });

  test("isOvernightShift detects overnight vs same-day", () => {
    expect(isOvernightShift("21:00", "17:00")).toBe(true);
    expect(isOvernightShift("21:00", "09:00")).toBe(true);
    expect(isOvernightShift("08:00", "17:00")).toBe(false);
  });

  test("computeCheckInStatus marks on_time up to deadline and late after", () => {
    expect(computeCheckInStatus("20:59", "21:00")).toBe("on_time");
    expect(computeCheckInStatus("21:00", "21:00")).toBe("on_time");
    expect(computeCheckInStatus("21:01", "21:00")).toBe("late");
  });

  test("computeCheckOutSubmissionStatus handles overnight shift across midnight", () => {
    // Sunday 2026-11-29 check-in, Monday 2026-11-30 16:00 WITA = 08:00Z -> on_time
    const onTime = computeCheckOutSubmissionStatus({
      attendanceDate: "2026-11-29",
      checkInDeadline: "21:00",
      checkOutDeadline: "17:00",
      now: new Date("2026-11-30T08:00:00.000Z"),
      timeZone: "Asia/Makassar",
    });
    expect(onTime).toBe("on_time");

    // Monday 2026-11-30 17:05 WITA = 09:05Z -> late_checkout
    const late = computeCheckOutSubmissionStatus({
      attendanceDate: "2026-11-29",
      checkInDeadline: "21:00",
      checkOutDeadline: "17:00",
      now: new Date("2026-11-30T09:05:00.000Z"),
      timeZone: "Asia/Makassar",
    });
    expect(late).toBe("late_checkout");
  });

  test("computeEffectiveCheckOutStatus ignores legacy rows and flags missed_checkout after deadline", () => {
    // Legacy row with null check_out_time is never missed_checkout
    expect(
      computeEffectiveCheckOutStatus({
        checkOutTime: null,
        persistedCheckOutStatus: null,
        attendanceDate: "2026-01-10",
        checkInStatus: "legacy",
        checkInDeadline: "21:00",
        checkOutDeadline: "17:00",
        now: new Date("2026-11-30T10:00:00.000Z"),
        timeZone: "Asia/Makassar",
      }),
    ).toBeNull();

    // Approved leave ("izin") with null check_out_time is never missed_checkout
    expect(
      computeEffectiveCheckOutStatus({
        checkOutTime: null,
        persistedCheckOutStatus: null,
        attendanceDate: "2026-11-29",
        checkInStatus: "izin",
        checkInDeadline: "21:00",
        checkOutDeadline: "17:00",
        now: new Date("2026-11-30T10:00:00.000Z"),
        timeZone: "Asia/Makassar",
      }),
    ).toBeNull();

    // Overnight 2026-11-29 at 2026-11-30 16:59 WITA (08:59Z) -> still open (null)
    expect(
      computeEffectiveCheckOutStatus({
        checkOutTime: null,
        persistedCheckOutStatus: null,
        attendanceDate: "2026-11-29",
        checkInStatus: "on_time",
        checkInDeadline: "21:00",
        checkOutDeadline: "17:00",
        now: new Date("2026-11-30T08:59:00.000Z"),
        timeZone: "Asia/Makassar",
      }),
    ).toBeNull();

    // Overnight 2026-11-29 at 2026-11-30 17:01 WITA (09:01Z) -> missed_checkout
    expect(
      computeEffectiveCheckOutStatus({
        checkOutTime: null,
        persistedCheckOutStatus: null,
        attendanceDate: "2026-11-29",
        checkInStatus: "on_time",
        checkInDeadline: "21:00",
        checkOutDeadline: "17:00",
        now: new Date("2026-11-30T09:01:00.000Z"),
        timeZone: "Asia/Makassar",
      }),
    ).toBe("missed_checkout");

    // Same-day shift 2026-11-30 at 2026-11-30 17:01 WITA -> missed_checkout
    expect(
      computeEffectiveCheckOutStatus({
        checkOutTime: null,
        persistedCheckOutStatus: null,
        attendanceDate: "2026-11-30",
        checkInStatus: "on_time",
        checkInDeadline: "08:00",
        checkOutDeadline: "17:00",
        now: new Date("2026-11-30T09:01:00.000Z"),
        timeZone: "Asia/Makassar",
      }),
    ).toBe("missed_checkout");
  });
});
