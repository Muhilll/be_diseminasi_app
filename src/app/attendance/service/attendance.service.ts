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
import { RolePermissionReadRepository } from "../../role_permission/repository/role-permission-read.repository";
import { AttendanceLeaveRepository } from "../repository/attendance-leave.repository";
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
    const permission =
      await RolePermissionReadRepository.getPermissionByRoleIdAndPermissionPath(
        roleId,
        "/api/attendances",
      );
    const canSeeAll = Boolean(permission?.can_report);
    const scopeUserId = canSeeAll ? undefined : userId;
    const [rows, setting, activeDaysByUser] = await Promise.all([
      AttendanceReadRepository.getAll(scopeUserId),
      AttendanceSettingRepository.getSetting(),
      AttendanceScheduleRepository.getActiveDaysByUserMap(scopeUserId),
    ]);

    const checkInDeadline = setting?.check_in_deadline ?? "21:00";
    const checkOutDeadline = setting?.check_out_deadline ?? "17:00";
    const now = new Date();

    return rows.map((row) => ({
      ...mapAttendanceResponse(row, checkInDeadline, checkOutDeadline, now),
      schedule_days: activeDaysByUser.get(row.user_id) ?? [],
    }));
  }

  private static async resolveCheckInTarget(
    userId: number,
    now: Date,
    checkInDeadline: string,
    checkOutDeadline: string,
  ): Promise<{
    attendanceDate: string;
    isOvernightCarryover: boolean;
    todayScheduleActive: boolean;
  }> {
    const { date: todayDate, dayOfWeek } = getLocalDateParts(now);
    const todaySchedule = await AttendanceScheduleRepository.getScheduleByUserAndDay(
      userId,
      dayOfWeek,
    );

    if (todaySchedule?.is_active) {
      return {
        attendanceDate: todayDate,
        isOvernightCarryover: false,
        todayScheduleActive: true,
      };
    }

    if (isOvernightShift(checkInDeadline, checkOutDeadline)) {
      const yesterdayDate = shiftDateString(todayDate, -1);
      const yesterdayDay = (dayOfWeek + 6) % 7;
      const yesterdaySchedule =
        await AttendanceScheduleRepository.getScheduleByUserAndDay(
          userId,
          yesterdayDay,
        );

      if (yesterdaySchedule?.is_active) {
        const yesterdayRows = await AttendanceReadRepository.findByUserAndDates(
          userId,
          [yesterdayDate],
        );
        const hasYesterdayAttendance = yesterdayRows.some(
          (r) => r.check_in_status !== "legacy",
        );

        if (!hasYesterdayAttendance) {
          return {
            attendanceDate: yesterdayDate,
            isOvernightCarryover: true,
            todayScheduleActive: false,
          };
        }
      }
    }

    return {
      attendanceDate: "",
      isOvernightCarryover: false,
      todayScheduleActive: false,
    };
  }

  static async getTodayStatus(userId: number, now: Date = new Date()) {
    const { date: todayDate, time: currentTime, dayOfWeek } = getLocalDateParts(now);
    const setting = await AttendanceSettingRepository.getSetting();

    const checkInDeadline = setting?.check_in_deadline ?? "21:00";
    const checkOutDeadline = setting?.check_out_deadline ?? "17:00";
    const overnight = isOvernightShift(checkInDeadline, checkOutDeadline);
    const datesToCheck = overnight
      ? [todayDate, shiftDateString(todayDate, -1)]
      : [todayDate];

    const [recentRows, todayLeaves, target] = await Promise.all([
      AttendanceReadRepository.findByUserAndDates(userId, datesToCheck),
      AttendanceLeaveRepository.findByUserAndDate(userId, todayDate),
      AttendanceService.resolveCheckInTarget(
        userId,
        now,
        checkInDeadline,
        checkOutDeadline,
      ),
    ]);
    const todayLeave = todayLeaves[0] ?? null;

    const todayRow =
      recentRows.find(
        (r) => r.attendance_date === todayDate && r.check_in_status !== "legacy",
      ) ?? null;
    const yesterdayOpenRow = overnight
      ? recentRows.find(
          (r) =>
            r.attendance_date === shiftDateString(todayDate, -1) &&
            r.check_out_time === null &&
            r.check_in_status !== "legacy" &&
            r.check_in_status !== "izin",
        ) ?? null
      : null;

    const activeRow =
      todayRow && todayRow.check_out_time === null
        ? todayRow
        : yesterdayOpenRow ?? todayRow;

    const targetHasAttendance =
      !!target.attendanceDate &&
      recentRows.some(
        (r) =>
          r.attendance_date === target.attendanceDate &&
          r.check_in_status !== "legacy",
      );

    return {
      server_time: currentTime,
      today_date: todayDate,
      day_of_week: dayOfWeek,
      settings: setting,
      schedule: {
        user_id: userId,
        day_of_week: dayOfWeek,
        is_active: target.todayScheduleActive,
      },
      can_check_in: Boolean(target.attendanceDate && !targetHasAttendance),
      check_in_target_date: target.attendanceDate || null,
      today_leave: todayLeave,
      attendance: activeRow
        ? mapAttendanceResponse(activeRow, checkInDeadline, checkOutDeadline, now)
        : null,
    };
  }

  static async checkIn(userId: number, payload: CheckInOutPayload, now = new Date()) {
    const setting = await AttendanceService.requireSetting();
    const { time: currentTime } = getLocalDateParts(now);

    const target = await AttendanceService.resolveCheckInTarget(
      userId,
      now,
      setting.check_in_deadline,
      setting.check_out_deadline,
    );
    if (!target.attendanceDate) {
      throw new AttendanceValidationError("No active schedule for today", 400);
    }

    const existingTargetRows = await AttendanceReadRepository.findByUserAndDates(
      userId,
      [target.attendanceDate],
    );
    const existingNonLegacy = existingTargetRows.find(
      (r) => r.check_in_status !== "legacy",
    );
    if (existingNonLegacy) {
      throw new AttendanceValidationError(
        existingNonLegacy.check_in_status === "izin"
          ? "You have an approved leave for today"
          : "You have already checked in today",
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

    const checkInStatus = target.isOvernightCarryover
      ? "late"
      : computeCheckInStatus(currentTime, setting.check_in_deadline);
    const result = await AttendanceWriteRepository.createCheckIn({
      user_id: userId,
      attendance_date: target.attendanceDate,
      check_in_time: now,
      check_in_lat: payload.latitude,
      check_in_lng: payload.longitude,
      check_in_image: payload.image,
      check_in_image_public_id: payload.image_public_id,
      check_in_note: payload.note ?? null,
      check_in_status: checkInStatus,
    });

    await AttendanceLeaveRepository.autoCancelPendingOnCheckIn(
      userId,
      target.attendanceDate,
      now,
    );

    return result;
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
      (r) =>
        r.check_out_time === null &&
        r.check_in_status !== "legacy" &&
        r.check_in_status !== "izin",
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

    if (row.check_in_status === "izin") {
      await AttendanceLeaveRepository.deleteApprovedForAttendance(
        row.user_id,
        row.attendance_date,
      );
    }

    const result = await AttendanceWriteRepository.deleteById(id);
    await Promise.all([
      deleteImageFromCloudinarySafely(row.check_in_image_public_id, "attendance"),
      deleteImageFromCloudinarySafely(row.check_out_image_public_id, "attendance"),
    ]);

    return result;
  }
}
