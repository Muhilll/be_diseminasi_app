import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { AttendanceScheduleRepository } from "../attendance_schedule/repository/attendance-schedule.repository";
import { AttendanceSettingRepository } from "../attendance_setting/repository/attendance-setting.repository";
import { RolePermissionReadRepository } from "../role_permission/repository/role-permission-read.repository";
import { AttendanceLeaveRepository } from "./repository/attendance-leave.repository";
import { AttendanceReadRepository } from "./repository/attendance-read.repository";
import { AttendanceWriteRepository } from "./repository/attendance-write.repository";
import { AttendanceLeaveService } from "./service/attendance-leave.service";
import {
  AttendanceService,
  AttendanceValidationError,
  mapAttendanceResponse,
} from "./service/attendance.service";

const mockSetting = {
  id: 1,
  location_name: "Basecamp",
  latitude: -5.147665,
  longitude: 119.432732,
  radius_meters: 100,
  check_in_deadline: "21:00",
  check_out_deadline: "17:00",
  created_at: new Date(),
  updated_at: new Date(),
};

const spies: Array<{ mockRestore: () => void }> = [];

afterEach(() => {
  while (spies.length > 0) {
    spies.pop()?.mockRestore();
  }
});

describe("AttendanceService", () => {
  test("rejects check-in when user has no active schedule for today", async () => {
    spies.push(
      spyOn(AttendanceSettingRepository, "getSetting").mockResolvedValue(mockSetting),
      spyOn(AttendanceScheduleRepository, "getScheduleByUserAndDay").mockResolvedValue({
        id: 1,
        user_id: 29,
        day_of_week: 0,
        is_active: false,
        created_at: new Date(),
        updated_at: new Date(),
      }),
    );

    await expect(
      AttendanceService.checkIn(
        29,
        {
          latitude: -5.147665,
          longitude: 119.432732,
          image: "https://example.com/a.jpg",
          image_public_id: "attendance/a",
        },
        new Date("2026-11-29T12:00:00.000Z"),
      ),
    ).rejects.toThrow(AttendanceValidationError);
  });

  test("rejects check-in when outside allowed radius", async () => {
    spies.push(
      spyOn(AttendanceSettingRepository, "getSetting").mockResolvedValue(mockSetting),
      spyOn(AttendanceScheduleRepository, "getScheduleByUserAndDay").mockResolvedValue({
        id: 1,
        user_id: 29,
        day_of_week: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }),
      spyOn(AttendanceReadRepository, "findByUserAndDates").mockResolvedValue([]),
    );

    await expect(
      AttendanceService.checkIn(
        29,
        {
          latitude: -5.16,
          longitude: 119.45,
          image: "https://example.com/a.jpg",
          image_public_id: "attendance/a",
        },
        new Date("2026-11-29T12:00:00.000Z"),
      ),
    ).rejects.toThrow(/Outside allowed attendance radius/);
  });

  test("rejects duplicate check-in on same attendance_date", async () => {
    spies.push(
      spyOn(AttendanceSettingRepository, "getSetting").mockResolvedValue(mockSetting),
      spyOn(AttendanceScheduleRepository, "getScheduleByUserAndDay").mockResolvedValue({
        id: 1,
        user_id: 29,
        day_of_week: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }),
      spyOn(AttendanceReadRepository, "findByUserAndDates").mockResolvedValue([
        {
          id: 10,
          user_id: 29,
          attendance_date: "2026-11-29",
          check_in_time: new Date("2026-11-29T12:00:00.000Z"),
          check_in_lat: -5.147665,
          check_in_lng: 119.432732,
          check_in_image: "https://example.com/a.jpg",
          check_in_image_public_id: "attendance/a",
          check_in_note: null,
          check_in_status: "on_time",
          check_out_time: null,
          check_out_lat: null,
          check_out_lng: null,
          check_out_image: null,
          check_out_image_public_id: null,
          check_out_note: null,
          check_out_status: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]),
    );

    await expect(
      AttendanceService.checkIn(
        29,
        {
          latitude: -5.147665,
          longitude: 119.432732,
          image: "https://example.com/b.jpg",
          image_public_id: "attendance/b",
        },
        new Date("2026-11-29T12:30:00.000Z"),
      ),
    ).rejects.toThrow(/already checked in today/);
  });

  test("records late check-in when past check_in_deadline", async () => {
    let capturedStatus = "";
    spies.push(
      spyOn(AttendanceSettingRepository, "getSetting").mockResolvedValue(mockSetting),
      spyOn(AttendanceScheduleRepository, "getScheduleByUserAndDay").mockResolvedValue({
        id: 1,
        user_id: 29,
        day_of_week: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }),
      spyOn(AttendanceReadRepository, "findByUserAndDates").mockResolvedValue([]),
      spyOn(AttendanceWriteRepository, "createCheckIn").mockImplementation(async (data) => {
        capturedStatus = data.check_in_status;
        return {} as never;
      }),
      spyOn(AttendanceLeaveRepository, "autoCancelPendingOnCheckIn").mockResolvedValue(
        {} as never,
      ),
    );

    // 13:15Z = 21:15 WITA (> 21:00)
    await AttendanceService.checkIn(
      29,
      {
        latitude: -5.147665,
        longitude: 119.432732,
        image: "https://example.com/a.jpg",
        image_public_id: "attendance/a",
      },
      new Date("2026-11-29T13:15:00.000Z"),
    );

    expect(capturedStatus).toBe("late");
  });

  test("allows overnight check-out on the next day against yesterday open check-in", async () => {
    let updatedId = 0;
    let capturedOutStatus = "";
    spies.push(
      spyOn(AttendanceSettingRepository, "getSetting").mockResolvedValue(mockSetting),
      spyOn(AttendanceReadRepository, "findByUserAndDates").mockResolvedValue([
        {
          id: 55,
          user_id: 29,
          attendance_date: "2026-11-29",
          check_in_time: new Date("2026-11-29T12:30:00.000Z"),
          check_in_lat: -5.147665,
          check_in_lng: 119.432732,
          check_in_image: "https://example.com/a.jpg",
          check_in_image_public_id: "attendance/a",
          check_in_note: null,
          check_in_status: "on_time",
          check_out_time: null,
          check_out_lat: null,
          check_out_lng: null,
          check_out_image: null,
          check_out_image_public_id: null,
          check_out_note: null,
          check_out_status: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]),
      spyOn(AttendanceWriteRepository, "updateCheckOut").mockImplementation(async (id, data) => {
        updatedId = id;
        capturedOutStatus = data.check_out_status;
        return {} as never;
      }),
    );

    // Monday 2026-11-30 16:00 WITA = 08:00Z (before 17:00)
    await AttendanceService.checkOut(
      29,
      {
        latitude: -5.147665,
        longitude: 119.432732,
        image: "https://example.com/out.jpg",
        image_public_id: "attendance/out",
      },
      new Date("2026-11-30T08:00:00.000Z"),
    );

    expect(updatedId).toBe(55);
    expect(capturedOutStatus).toBe("on_time");
  });

  test("mapAttendanceResponse does not flag legacy rows as missed_checkout", () => {
    const mapped = mapAttendanceResponse(
      {
        id: 1,
        user_id: 29,
        attendance_date: "2026-01-01",
        check_in_time: new Date("2026-01-01T00:00:00.000Z"),
        check_in_lat: null,
        check_in_lng: null,
        check_in_image: "https://example.com/old.jpg",
        check_in_image_public_id: "absensi/old",
        check_in_note: "old",
        check_in_status: "legacy",
        check_out_time: null,
        check_out_lat: null,
        check_out_lng: null,
        check_out_image: null,
        check_out_image_public_id: null,
        check_out_note: null,
        check_out_status: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      "21:00",
      "17:00",
      new Date("2026-11-30T10:00:00.000Z"),
    );

    expect(mapped.check_out_status).toBeNull();
  });

  test("getTodayStatus keeps yesterday open shift available on Monday until Tuesday 00:00", async () => {
    const sundayRow = {
      id: 55,
      user_id: 29,
      attendance_date: "2026-11-29",
      check_in_time: new Date("2026-11-29T12:30:00.000Z"),
      check_in_lat: -5.147665,
      check_in_lng: 119.432732,
      check_in_image: "https://example.com/a.jpg",
      check_in_image_public_id: "attendance/a",
      check_in_note: null,
      check_in_status: "on_time",
      check_out_time: null,
      check_out_lat: null,
      check_out_lng: null,
      check_out_image: null,
      check_out_image_public_id: null,
      check_out_note: null,
      check_out_status: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    spies.push(
      spyOn(AttendanceSettingRepository, "getSetting").mockResolvedValue(mockSetting),
      spyOn(AttendanceScheduleRepository, "getScheduleByUserAndDay").mockResolvedValue({
        id: 1,
        user_id: 29,
        day_of_week: 1,
        is_active: false,
        created_at: new Date(),
        updated_at: new Date(),
      }),
      spyOn(AttendanceLeaveRepository, "findByUserAndDate").mockResolvedValue([]),
      spyOn(AttendanceReadRepository, "findByUserAndDates").mockImplementation(
        async (_uid, dates) => (dates.includes("2026-11-29") ? [sundayRow] : []),
      ),
    );

    // Monday 2026-11-30 20:30 WITA (12:30Z) -> still open for late_checkout
    const mondayStatus = await AttendanceService.getTodayStatus(
      29,
      new Date("2026-11-30T12:30:00.000Z"),
    );
    expect(mondayStatus.attendance?.id).toBe(55);

    // Tuesday 2026-12-01 00:00 WITA (2026-11-30T16:00:00Z) -> closed
    const tuesdayStatus = await AttendanceService.getTodayStatus(
      29,
      new Date("2026-11-30T16:00:00.000Z"),
    );
    expect(tuesdayStatus.attendance).toBeNull();
  });

  test("getAll scopes by userId unless role has can_report on /api/attendances", async () => {
    const calls: Array<number | undefined> = [];
    spies.push(
      spyOn(AttendanceSettingRepository, "getSetting").mockResolvedValue(mockSetting),
      spyOn(AttendanceReadRepository, "getAll").mockImplementation(async (uid) => {
        calls.push(uid);
        return [];
      }),
      spyOn(
        RolePermissionReadRepository,
        "getPermissionByRoleIdAndPermissionPath",
      )
        .mockResolvedValueOnce({
          can_read: true,
          can_create: true,
          can_update: true,
          can_delete: false,
          can_report: false,
        })
        .mockResolvedValueOnce({
          can_read: true,
          can_create: true,
          can_update: true,
          can_delete: true,
          can_report: true,
        }),
    );

    await AttendanceService.getAll(29, 6);
    await AttendanceService.getAll(29, 4);

    expect(calls).toEqual([29, undefined]);
  });
});

describe("AttendanceLeaveService", () => {
  test("rejects submitLeave for past date or inactive schedule day", async () => {
    await expect(
      AttendanceLeaveService.submitLeave(
        29,
        { leave_date: "2026-11-28", reason: "Sakit" },
        new Date("2026-11-29T10:00:00.000Z"),
      ),
    ).rejects.toThrow(/past/);

    spies.push(
      spyOn(AttendanceScheduleRepository, "getScheduleByUserAndDay").mockResolvedValue({
        id: 1,
        user_id: 29,
        day_of_week: 0,
        is_active: false,
        created_at: new Date(),
        updated_at: new Date(),
      }),
    );

    await expect(
      AttendanceLeaveService.submitLeave(
        29,
        { leave_date: "2026-11-29", reason: "Sakit" },
        new Date("2026-11-29T10:00:00.000Z"),
      ),
    ).rejects.toThrow(/No active schedule/);
  });

  test("rejects duplicate pending/approved leave on the same date", async () => {
    spies.push(
      spyOn(AttendanceScheduleRepository, "getScheduleByUserAndDay").mockResolvedValue({
        id: 1,
        user_id: 29,
        day_of_week: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }),
      spyOn(AttendanceLeaveRepository, "findByUserAndDate").mockResolvedValue([
        {
          id: 1,
          user_id: 29,
          leave_date: "2026-11-29",
          reason: "Acara keluarga",
          attachment: null,
          attachment_public_id: null,
          status: "pending",
          reviewed_by: null,
          reviewed_at: null,
          review_note: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]),
    );

    await expect(
      AttendanceLeaveService.submitLeave(
        29,
        { leave_date: "2026-11-29", reason: "Sakit" },
        new Date("2026-11-29T10:00:00.000Z"),
      ),
    ).rejects.toThrow(/already exists/);
  });

  test("reviewLeave approve inserts izin attendance in transaction", async () => {
    let approvedLeaveId = 0;
    spies.push(
      spyOn(AttendanceLeaveRepository, "getById").mockResolvedValue({
        id: 12,
        user_id: 29,
        leave_date: "2026-11-29",
        reason: "Sakit demam",
        attachment: null,
        attachment_public_id: null,
        status: "pending",
        reviewed_by: null,
        reviewed_at: null,
        review_note: null,
        created_at: new Date(),
        updated_at: new Date(),
      }),
      spyOn(AttendanceReadRepository, "findByUserAndDates").mockResolvedValue([]),
      spyOn(
        AttendanceLeaveRepository,
        "approveAndInsertAttendance",
      ).mockImplementation(async (params) => {
        approvedLeaveId = params.leave.id;
        return {} as never;
      }),
    );

    await AttendanceLeaveService.reviewLeave(12, 3, {
      action: "approve",
      review_note: "Cepat sembuh",
    });

    expect(approvedLeaveId).toBe(12);
  });

  test("deleteById on izin attendance deletes linked approved leave", async () => {
    const deletedLeaveArgs: Array<[number, string]> = [];
    spies.push(
      spyOn(AttendanceReadRepository, "getById").mockResolvedValue({
        id: 77,
        user_id: 29,
        attendance_date: "2026-11-29",
        check_in_time: new Date(),
        check_in_lat: null,
        check_in_lng: null,
        check_in_image: "",
        check_in_image_public_id: "",
        check_in_note: "Sakit",
        check_in_status: "izin",
        check_out_time: null,
        check_out_lat: null,
        check_out_lng: null,
        check_out_image: null,
        check_out_image_public_id: null,
        check_out_note: null,
        check_out_status: null,
        created_at: new Date(),
        updated_at: new Date(),
        user_name: "Maudy",
        user_email: "aprilamaudy@gmail.com",
        user_employee_id: "APRIL-001",
        role_code: "USER",
      }),
      spyOn(
        AttendanceLeaveRepository,
        "deleteApprovedForAttendance",
      ).mockImplementation(async (uid, date) => {
        deletedLeaveArgs.push([uid, date]);
        return {} as never;
      }),
      spyOn(AttendanceWriteRepository, "deleteById").mockResolvedValue({} as never),
    );

    await AttendanceService.deleteById(77);
    expect(deletedLeaveArgs).toEqual([[29, "2026-11-29"]]);
  });

  test("allows overnight late check-in on Monday when Sunday was active and Monday is inactive, but rejects on Tuesday", async () => {
    let capturedDate = "";
    let capturedStatus = "";

    spies.push(
      spyOn(AttendanceSettingRepository, "getSetting").mockResolvedValue(mockSetting),
      spyOn(AttendanceScheduleRepository, "getScheduleByUserAndDay").mockImplementation(
        async (_uid, day) => ({
          id: 1,
          user_id: 29,
          day_of_week: day,
          is_active: day === 0, // Only Sunday active
          created_at: new Date(),
          updated_at: new Date(),
        }),
      ),
      spyOn(AttendanceReadRepository, "findByUserAndDates").mockResolvedValue([]),
      spyOn(AttendanceWriteRepository, "createCheckIn").mockImplementation(async (data) => {
        capturedDate = data.attendance_date;
        capturedStatus = data.check_in_status;
        return {} as never;
      }),
      spyOn(AttendanceLeaveRepository, "autoCancelPendingOnCheckIn").mockResolvedValue(
        {} as never,
      ),
    );

    // Monday 2026-11-30 01:00 WITA (2026-11-29T17:00:00Z) -> allowed as late for Sunday 2026-11-29
    await AttendanceService.checkIn(
      29,
      {
        latitude: -5.147665,
        longitude: 119.432732,
        image: "https://example.com/a.jpg",
        image_public_id: "attendance/a",
      },
      new Date("2026-11-29T17:00:00.000Z"),
    );

    expect(capturedDate).toBe("2026-11-29");
    expect(capturedStatus).toBe("late");

    // Tuesday 2026-12-01 00:00 WITA (2026-11-30T16:00:00Z) -> rejected
    await expect(
      AttendanceService.checkIn(
        29,
        {
          latitude: -5.147665,
          longitude: 119.432732,
          image: "https://example.com/b.jpg",
          image_public_id: "attendance/b",
        },
        new Date("2026-11-30T16:00:00.000Z"),
      ),
    ).rejects.toThrow(/No active schedule/);
  });
});
