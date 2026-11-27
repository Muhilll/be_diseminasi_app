import { and, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { attendance_leaves, attendances, db, users } from "../../../db";

const reviewerUsers = alias(users, "reviewer_users");

export type AttendanceLeaveWithUserRow = typeof attendance_leaves.$inferSelect & {
  user_name: string;
  user_email: string;
  reviewer_name: string | null;
};

const leaveWithUserSelect = {
  id: attendance_leaves.id,
  user_id: attendance_leaves.user_id,
  leave_date: attendance_leaves.leave_date,
  reason: attendance_leaves.reason,
  attachment: attendance_leaves.attachment,
  attachment_public_id: attendance_leaves.attachment_public_id,
  status: attendance_leaves.status,
  reviewed_by: attendance_leaves.reviewed_by,
  reviewed_at: attendance_leaves.reviewed_at,
  review_note: attendance_leaves.review_note,
  created_at: attendance_leaves.created_at,
  updated_at: attendance_leaves.updated_at,
  user_name: users.name,
  user_email: users.email,
  reviewer_name: reviewerUsers.name,
};

export class AttendanceLeaveRepository {
  static async getAll(userId?: number): Promise<AttendanceLeaveWithUserRow[]> {
    const query = db
      .select(leaveWithUserSelect)
      .from(attendance_leaves)
      .innerJoin(users, eq(attendance_leaves.user_id, users.id))
      .leftJoin(reviewerUsers, eq(attendance_leaves.reviewed_by, reviewerUsers.id));

    if (userId !== undefined) {
      return query
        .where(eq(attendance_leaves.user_id, userId))
        .orderBy(desc(attendance_leaves.created_at));
    }

    return query.orderBy(desc(attendance_leaves.created_at));
  }

  static async getById(id: number): Promise<typeof attendance_leaves.$inferSelect | null> {
    const rows = await db
      .select()
      .from(attendance_leaves)
      .where(eq(attendance_leaves.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  static async findByUserAndDate(userId: number, leaveDate: string) {
    return db
      .select()
      .from(attendance_leaves)
      .where(
        and(
          eq(attendance_leaves.user_id, userId),
          eq(attendance_leaves.leave_date, leaveDate),
        ),
      )
      .orderBy(desc(attendance_leaves.created_at));
  }

  static async create(data: {
    user_id: number;
    leave_date: string;
    reason: string;
    attachment: string | null;
    attachment_public_id: string | null;
  }) {
    return db.insert(attendance_leaves).values({
      ...data,
      status: "pending",
    });
  }

  static async updateReview(
    id: number,
    data: {
      status: "approved" | "rejected";
      reviewed_by: number;
      reviewed_at: Date;
      review_note: string | null;
    },
  ) {
    return db
      .update(attendance_leaves)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(attendance_leaves.id, id));
  }

  static async approveAndInsertAttendance(params: {
    leave: typeof attendance_leaves.$inferSelect;
    reviewedBy: number;
    reviewedAt: Date;
    reviewNote: string | null;
  }) {
    return db.transaction(async (tx) => {
      await tx
        .update(attendance_leaves)
        .set({
          status: "approved",
          reviewed_by: params.reviewedBy,
          reviewed_at: params.reviewedAt,
          review_note: params.reviewNote,
          updated_at: params.reviewedAt,
        })
        .where(eq(attendance_leaves.id, params.leave.id));

      await tx.insert(attendances).values({
        user_id: params.leave.user_id,
        attendance_date: params.leave.leave_date,
        check_in_time: params.reviewedAt,
        check_in_lat: null,
        check_in_lng: null,
        check_in_image: params.leave.attachment ?? "",
        check_in_image_public_id: params.leave.attachment_public_id ?? "",
        check_in_note: params.leave.reason,
        check_in_status: "izin",
      });
    });
  }

  static async autoCancelPendingOnCheckIn(
    userId: number,
    attendanceDate: string,
    now: Date,
  ) {
    return db
      .update(attendance_leaves)
      .set({
        status: "rejected",
        reviewed_at: now,
        review_note: "Auto-cancelled: user checked in",
        updated_at: now,
      })
      .where(
        and(
          eq(attendance_leaves.user_id, userId),
          eq(attendance_leaves.leave_date, attendanceDate),
          eq(attendance_leaves.status, "pending"),
        ),
      );
  }

  static async deleteApprovedForAttendance(userId: number, attendanceDate: string) {
    return db
      .delete(attendance_leaves)
      .where(
        and(
          eq(attendance_leaves.user_id, userId),
          eq(attendance_leaves.leave_date, attendanceDate),
          eq(attendance_leaves.status, "approved"),
        ),
      );
  }
}
