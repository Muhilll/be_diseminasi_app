import { and, desc, eq, inArray } from "drizzle-orm";
import { attendances, db, roles, users } from "../../../db";

export type AttendanceWithUserRow = typeof attendances.$inferSelect & {
  user_name: string;
  user_email: string;
  user_employee_id: string | null;
  role_code: string;
};

const attendanceWithUserSelect = {
  id: attendances.id,
  user_id: attendances.user_id,
  attendance_date: attendances.attendance_date,
  check_in_time: attendances.check_in_time,
  check_in_lat: attendances.check_in_lat,
  check_in_lng: attendances.check_in_lng,
  check_in_image: attendances.check_in_image,
  check_in_image_public_id: attendances.check_in_image_public_id,
  check_in_note: attendances.check_in_note,
  check_in_status: attendances.check_in_status,
  check_out_time: attendances.check_out_time,
  check_out_lat: attendances.check_out_lat,
  check_out_lng: attendances.check_out_lng,
  check_out_image: attendances.check_out_image,
  check_out_image_public_id: attendances.check_out_image_public_id,
  check_out_note: attendances.check_out_note,
  check_out_status: attendances.check_out_status,
  created_at: attendances.created_at,
  updated_at: attendances.updated_at,
  user_name: users.name,
  user_email: users.email,
  user_employee_id: users.employee_id,
  role_code: roles.code,
};

export class AttendanceReadRepository {
  static async getAll(userId?: number): Promise<AttendanceWithUserRow[]> {
    const query = db
      .select(attendanceWithUserSelect)
      .from(attendances)
      .innerJoin(users, eq(attendances.user_id, users.id))
      .innerJoin(roles, eq(users.role_id, roles.id));

    if (userId !== undefined) {
      return query
        .where(eq(attendances.user_id, userId))
        .orderBy(desc(attendances.check_in_time));
    }

    return query.orderBy(desc(attendances.check_in_time));
  }

  static async getById(id: number): Promise<AttendanceWithUserRow | null> {
    const rows = await db
      .select(attendanceWithUserSelect)
      .from(attendances)
      .innerJoin(users, eq(attendances.user_id, users.id))
      .innerJoin(roles, eq(users.role_id, roles.id))
      .where(eq(attendances.id, id))
      .limit(1);

    return rows[0] ?? null;
  }

  static async getUserRoleCode(roleId: number): Promise<string | null> {
    const rows = await db
      .select({ code: roles.code })
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);
    return rows[0]?.code ?? null;
  }

  static async findByUserAndDates(
    userId: number,
    dates: string[],
  ): Promise<(typeof attendances.$inferSelect)[]> {
    if (dates.length === 0) return [];
    return db
      .select()
      .from(attendances)
      .where(
        and(
          eq(attendances.user_id, userId),
          inArray(attendances.attendance_date, dates),
        ),
      )
      .orderBy(desc(attendances.check_in_time));
  }
}
