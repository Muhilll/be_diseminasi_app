import {
  calculateDistanceMeters,
  computeCheckInStatus,
  computeCheckOutSubmissionStatus,
  computeEffectiveCheckOutStatus,
  getLocalDateParts,
  isOvernightShift,
  shiftDateString,
} from "../../../utils/attendance";
import { deleteImageFromCloudinarySafely } from "../../../utils/cloudinary";
import { AttendanceScheduleRepository } from "../../attendance_schedule/repository/attendance-schedule.repository";
import { AttendanceSettingRepository } from "../../attendance_setting/repository/attendance-setting.repository";
import {
  AttendanceReadRepository,
  type AttendanceWithUserRow,
} from "../repository/attendance-read.repository";
import { AttendanceWriteRepository } from "../repository/attendance-write.repository";

export type CheckInOutPayload = {
  latitude: number;
  longitude: number;
  image: string;
  image_public_id: string;
  note?: string;
};

export class AttendanceValidationError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function mapAttendanceResponse(
  row: AttendanceWithUserRow | typeof import("../../../db").attendances.$inferSelect,
  checkInDeadline: string,
  checkOutDeadline: string,
  now: Date = new Date(),
) {
  const effectiveCheckOutStatus = computeEffectiveCheckOutStatus({
    checkOutTime: row.check_out_time,
    persistedCheckOutStatus: row.check_out_status,
    attendanceDate: row.attendance_date,
    checkInStatus: row.check_in_status,
    checkInDeadline,
    checkOutDeadline,
    now,
  });

  return {
    id: row.id,
    user_id: row.user_id,
    attendance_date: row.attendance_date,
    check_in_time: row.check_in_time,
    check_in_lat: row.check_in_lat,
    check_in_lng: row.check_in_lng,
    check_in_image: row.check_in_image,
    check_in_image_public_id: row.check_in_image_public_id,
    check_in_note: row.check_in_note,
    check_in_status: row.check_in_status,
    check_out_time: row.check_out_time,
    check_out_lat: row.check_out_lat,
    check_out_lng: row.check_out_lng,
    check_out_image: row.check_out_image,
    check_out_image_public_id: row.check_out_image_public_id,
    check_out_note: row.check_out_note,
    check_out_status: effectiveCheckOutStatus,
    created_at: row.created_at,
    updated_at: row.updated_at,
    ...("user_name" in row
      ? {
          user: {
            id: row.user_id,
            name: row.user_name,
            email: row.user_email,
            employee_id: row.user_employee_id,
          },
        }
      : {}),
  };
}

export class AttendanceService {
  private static async requireSetting() {
    const setting = await AttendanceSettingRepository.getSetting();
    if (!setting) {
      throw new AttendanceValidationError(
        "Attendance settings are not configured yet",
        400,
      );
    }
    return setting;
  }

  static async getAll(userId: number, roleId: number) {
    const roleCode = await AttendanceReadRepository.getUserRoleCode(roleId);
    const isAdmin = roleCode === "ADMIN";
    const [rows, setting] = await Promise.all([
      AttendanceReadRepository.getAll(isAdmin ? undefined : userId),
      AttendanceSettingRepository.getSetting(),
    ]);

    const checkInDeadline = setting?.check_in_deadline ?? "21:00";
    const checkOutDeadline = setting?.check_out_deadline ?? "17:00";
    const now = new Date();

    return rows.map((row) =>
      mapAttendanceResponse(row, checkInDeadline, checkOutDeadline, now),
    );
  }

  static async getTodayStatus(userId: number) {
    const now = new Date();
    const { date: todayDate, time: currentTime, dayOfWeek } = getLocalDateParts(now);
    const setting = await AttendanceSettingRepository.getSetting();
    const schedule = await AttendanceScheduleRepository.getScheduleByUserAndDay(
      userId,
      dayOfWeek,
    );

    const checkInDeadline = setting?.check_in_deadline ?? "21:00";
    const checkOutDeadline = setting?.check_out_deadline ?? "17:00";
    const overnight = isOvernightShift(checkInDeadline, checkOutDeadline);
    const datesToCheck = overnight
      ? [todayDate, shiftDateString(todayDate, -1)]
      : [todayDate];

    const recentRows = await AttendanceReadRepository.findByUserAndDates(
      userId,
      datesToCheck,
    );

    const todayRow = recentRows.find((r) => r.attendance_date === todayDate) ?? null;
    const yesterdayOpenRow = overnight
      ? recentRows.find(
          (r) =>
            r.attendance_date === shiftDateString(todayDate, -1) &&
            r.check_out_time === null &&
            r.check_in_status !== "legacy",
        ) ?? null
      : null;

    const activeRow =
      todayRow && todayRow.check_out_time === null
        ? todayRow
        : yesterdayOpenRow ?? todayRow;

    return {
      server_time: currentTime,
      today_date: todayDate,
      day_of_week: dayOfWeek,
      settings: setting,
      schedule: schedule ?? { user_id: userId, day_of_week: dayOfWeek, is_active: false },
      attendance: activeRow
        ? mapAttendanceResponse(activeRow, checkInDeadline, checkOutDeadline, now)
        : null,
    };
  }

  static async checkIn(userId: number, payload: CheckInOutPayload, now = new Date()) {
    const setting = await AttendanceService.requireSetting();
    const { date: todayDate, time: currentTime, dayOfWeek } = getLocalDateParts(now);

    const schedule = await AttendanceScheduleRepository.getScheduleByUserAndDay(
      userId,
      dayOfWeek,
    );
    if (!schedule || !schedule.is_active) {
      throw new AttendanceValidationError("No active schedule for today", 400);
    }

    const existingToday = await AttendanceReadRepository.findByUserAndDates(userId, [
      todayDate,
    ]);
    if (existingToday.some((r) => r.check_in_status !== "legacy")) {
      throw new AttendanceValidationError("You have already checked in today", 400);
    }

    const distance = calculateDistanceMeters(
      payload.latitude,
      payload.longitude,
      setting.latitude,
      setting.longitude,
    );
    if (distance > setting.radius_meters) {
      throw new AttendanceValidationError(
        `Outside allowed attendance radius (${Math.round(distance)}m > ${setting.radius_meters}m)`,
        400,
      );
    }

    const checkInStatus = computeCheckInStatus(currentTime, setting.check_in_deadline);
    return AttendanceWriteRepository.createCheckIn({
      user_id: userId,
      attendance_date: todayDate,
      check_in_time: now,
      check_in_lat: payload.latitude,
      check_in_lng: payload.longitude,
      check_in_image: payload.image,
      check_in_image_public_id: payload.image_public_id,
      check_in_note: payload.note ?? null,
      check_in_status: checkInStatus,
    });
  }

  static async checkOut(userId: number, payload: CheckInOutPayload, now = new Date()) {
    const setting = await AttendanceService.requireSetting();
    const { date: todayDate } = getLocalDateParts(now);
    const overnight = isOvernightShift(
      setting.check_in_deadline,
      setting.check_out_deadline,
    );

    const datesToCheck = overnight
      ? [todayDate, shiftDateString(todayDate, -1)]
      : [todayDate];

    const candidates = await AttendanceReadRepository.findByUserAndDates(
      userId,
      datesToCheck,
    );

    const openRow = candidates.find(
      (r) => r.check_out_time === null && r.check_in_status !== "legacy",
    );

    if (!openRow) {
      throw new AttendanceValidationError(
        "No open check-in found to check out",
        400,
      );
    }

    const distance = calculateDistanceMeters(
      payload.latitude,
      payload.longitude,
      setting.latitude,
      setting.longitude,
    );
    if (distance > setting.radius_meters) {
      throw new AttendanceValidationError(
        `Outside allowed attendance radius (${Math.round(distance)}m > ${setting.radius_meters}m)`,
        400,
      );
    }

    const checkOutStatus = computeCheckOutSubmissionStatus({
      attendanceDate: openRow.attendance_date,
      checkInDeadline: setting.check_in_deadline,
      checkOutDeadline: setting.check_out_deadline,
      now,
    });

    return AttendanceWriteRepository.updateCheckOut(openRow.id, {
      check_out_time: now,
      check_out_lat: payload.latitude,
      check_out_lng: payload.longitude,
      check_out_image: payload.image,
      check_out_image_public_id: payload.image_public_id,
      check_out_note: payload.note ?? null,
      check_out_status: checkOutStatus,
    });
  }

  static async deleteById(id: number) {
    const row = await AttendanceReadRepository.getById(id);
    if (!row) return null;

    const result = await AttendanceWriteRepository.deleteById(id);
    await Promise.all([
      deleteImageFromCloudinarySafely(row.check_in_image_public_id, "attendance"),
      deleteImageFromCloudinarySafely(row.check_out_image_public_id, "attendance"),
    ]);

    return result;
  }
}
