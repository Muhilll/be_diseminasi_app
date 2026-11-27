import { getLocalDateParts } from "../../../utils/attendance";
import { AttendanceScheduleRepository } from "../../attendance_schedule/repository/attendance-schedule.repository";
import { RolePermissionReadRepository } from "../../role_permission/repository/role-permission-read.repository";
import {
  AttendanceLeaveRepository,
  type AttendanceLeaveWithUserRow,
} from "../repository/attendance-leave.repository";
import { AttendanceReadRepository } from "../repository/attendance-read.repository";
import { AttendanceValidationError } from "./attendance.service";

export type SubmitLeavePayload = {
  leave_date: string;
  reason: string;
  attachment?: string;
  attachment_public_id?: string;
};

export type ReviewLeavePayload = {
  action: "approve" | "reject";
  review_note?: string;
};

function getDayOfWeekFromDateStr(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function mapLeaveResponse(row: AttendanceLeaveWithUserRow) {
  return {
    id: row.id,
    user_id: row.user_id,
    leave_date: row.leave_date,
    reason: row.reason,
    attachment: row.attachment,
    attachment_public_id: row.attachment_public_id,
    status: row.status,
    reviewed_by: row.reviewed_by,
    reviewed_at: row.reviewed_at,
    review_note: row.review_note,
    created_at: row.created_at,
    updated_at: row.updated_at,
    user: {
      id: row.user_id,
      name: row.user_name,
      email: row.user_email,
    },
    reviewer: row.reviewed_by
      ? {
          id: row.reviewed_by,
          name: row.reviewer_name,
        }
      : null,
  };
}

export class AttendanceLeaveService {
  static async getAll(userId: number, roleId: number) {
    const permission =
      await RolePermissionReadRepository.getPermissionByRoleIdAndPermissionPath(
        roleId,
        "/api/attendances",
      );
    const canSeeAll = Boolean(permission?.can_report);
    const rows = await AttendanceLeaveRepository.getAll(
      canSeeAll ? undefined : userId,
    );
    return rows.map(mapLeaveResponse);
  }

  static async submitLeave(
    userId: number,
    payload: SubmitLeavePayload,
    now: Date = new Date(),
  ) {
    if (
      (payload.attachment && !payload.attachment_public_id) ||
      (!payload.attachment && payload.attachment_public_id)
    ) {
      throw new AttendanceValidationError(
        "attachment and attachment_public_id must be provided together",
        400,
      );
    }

    const { date: todayDate } = getLocalDateParts(now);
    if (payload.leave_date < todayDate) {
      throw new AttendanceValidationError(
        "Leave date cannot be in the past",
        400,
      );
    }

    const dayOfWeek = getDayOfWeekFromDateStr(payload.leave_date);
    const schedule = await AttendanceScheduleRepository.getScheduleByUserAndDay(
      userId,
      dayOfWeek,
    );
    if (!schedule || !schedule.is_active) {
      throw new AttendanceValidationError(
        "No active schedule on the selected leave date",
        400,
      );
    }

    const existingLeaves = await AttendanceLeaveRepository.findByUserAndDate(
      userId,
      payload.leave_date,
    );
    if (
      existingLeaves.some(
        (l) => l.status === "pending" || l.status === "approved",
      )
    ) {
      throw new AttendanceValidationError(
        "A pending or approved leave request already exists for this date",
        400,
      );
    }

    const existingAttendances = await AttendanceReadRepository.findByUserAndDates(
      userId,
      [payload.leave_date],
    );
    if (existingAttendances.some((a) => a.check_in_status !== "legacy")) {
      throw new AttendanceValidationError(
        "Attendance record already exists for this date",
        400,
      );
    }

    return AttendanceLeaveRepository.create({
      user_id: userId,
      leave_date: payload.leave_date,
      reason: payload.reason.trim(),
      attachment: payload.attachment ?? null,
      attachment_public_id: payload.attachment_public_id ?? null,
    });
  }

  static async reviewLeave(
    leaveId: number,
    reviewerId: number,
    payload: ReviewLeavePayload,
    now: Date = new Date(),
  ) {
    const leave = await AttendanceLeaveRepository.getById(leaveId);
    if (!leave) {
      throw new AttendanceValidationError("Leave request not found", 404);
    }

    if (leave.status !== "pending") {
      throw new AttendanceValidationError(
        "Only pending leave requests can be reviewed",
        400,
      );
    }

    const reviewNote = payload.review_note?.trim() || null;

    if (payload.action === "reject") {
      return AttendanceLeaveRepository.updateReview(leave.id, {
        status: "rejected",
        reviewed_by: reviewerId,
        reviewed_at: now,
        review_note: reviewNote,
      });
    }

    const existingAttendances = await AttendanceReadRepository.findByUserAndDates(
      leave.user_id,
      [leave.leave_date],
    );
    if (existingAttendances.some((a) => a.check_in_status !== "legacy")) {
      throw new AttendanceValidationError(
        "User already has an attendance record for this date",
        400,
      );
    }

    return AttendanceLeaveRepository.approveAndInsertAttendance({
      leave,
      reviewedBy: reviewerId,
      reviewedAt: now,
      reviewNote,
    });
  }
}
