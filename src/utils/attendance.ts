const DEFAULT_TIMEZONE = process.env.APP_TIMEZONE || "Asia/Makassar";

export type LocalDateParts = {
  date: string;
  time: string;
  dayOfWeek: number;
};

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** Haversine distance in meters between two WGS84 coordinates. */
export function calculateDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusMeters = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMeters * c;
}

/** Extract YYYY-MM-DD, HH:mm, and 0..6 dayOfWeek in the configured timezone. */
export function getLocalDateParts(
  date: Date = new Date(),
  timeZone: string = DEFAULT_TIMEZONE,
): LocalDateParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const hour = get("hour") === "24" ? "00" : get("hour");

  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${hour}:${get("minute")}`,
    dayOfWeek: WEEKDAY_INDEX[get("weekday")] ?? 0,
  };
}

/** Shift a YYYY-MM-DD date string by deltaDays using UTC calendar arithmetic. */
export function shiftDateString(dateStr: string, deltaDays: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + deltaDays));
  return utc.toISOString().slice(0, 10);
}

/** True when checkOutDeadline <= checkInDeadline (e.g. 21:00 -> 17:00 next day). */
export function isOvernightShift(
  checkInDeadline: string,
  checkOutDeadline: string,
): boolean {
  return checkOutDeadline <= checkInDeadline;
}

export function computeCheckInStatus(
  localTime: string,
  checkInDeadline: string,
): "on_time" | "late" {
  return localTime <= checkInDeadline ? "on_time" : "late";
}

function getEffectiveDeadlineDateTime(
  attendanceDate: string,
  checkInDeadline: string,
  checkOutDeadline: string,
): string {
  const deadlineDate = isOvernightShift(checkInDeadline, checkOutDeadline)
    ? shiftDateString(attendanceDate, 1)
    : attendanceDate;
  return `${deadlineDate} ${checkOutDeadline}`;
}

export function computeCheckOutSubmissionStatus(params: {
  attendanceDate: string;
  checkInDeadline: string;
  checkOutDeadline: string;
  now?: Date;
  timeZone?: string;
}): "on_time" | "late_checkout" {
  const { date, time } = getLocalDateParts(params.now, params.timeZone);
  const current = `${date} ${time}`;
  const deadline = getEffectiveDeadlineDateTime(
    params.attendanceDate,
    params.checkInDeadline,
    params.checkOutDeadline,
  );
  return current <= deadline ? "on_time" : "late_checkout";
}

export function computeEffectiveCheckOutStatus(params: {
  checkOutTime: Date | null;
  persistedCheckOutStatus: string | null;
  attendanceDate: string;
  checkInStatus: string;
  checkInDeadline: string;
  checkOutDeadline: string;
  now?: Date;
  timeZone?: string;
}): string | null {
  if (params.checkOutTime) {
    return params.persistedCheckOutStatus;
  }

  if (params.checkInStatus === "legacy" || params.checkInStatus === "izin") {
    return null;
  }

  const { date, time } = getLocalDateParts(params.now, params.timeZone);
  const current = `${date} ${time}`;
  const deadline = getEffectiveDeadlineDateTime(
    params.attendanceDate,
    params.checkInDeadline,
    params.checkOutDeadline,
  );

  return current > deadline ? "missed_checkout" : null;
}
