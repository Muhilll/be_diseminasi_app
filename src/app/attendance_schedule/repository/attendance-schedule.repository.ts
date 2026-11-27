import { and, asc, eq } from "drizzle-orm";
import { attendance_schedules, db, roles, users } from "../../../db";

export type ScheduleDayDto = {
  day_of_week: number;
  is_active: boolean;
};

export type UserScheduleDto = {
  user_id: number;
  user_name: string;
  user_email: string;
  role_code: string;
  schedules: ScheduleDayDto[];
};

export class AttendanceScheduleRepository {
  static async getActiveDaysByUserMap(userId?: number): Promise<Map<number, number[]>> {
    const whereClause =
      userId !== undefined
        ? and(eq(attendance_schedules.is_active, true), eq(attendance_schedules.user_id, userId))
        : eq(attendance_schedules.is_active, true);

    const rows = await db
      .select({
        user_id: attendance_schedules.user_id,
        day_of_week: attendance_schedules.day_of_week,
      })
      .from(attendance_schedules)
      .where(whereClause)
      .orderBy(asc(attendance_schedules.day_of_week));

    const map = new Map<number, number[]>();
    for (const r of rows) {
      const list = map.get(r.user_id);
      if (list) list.push(r.day_of_week);
      else map.set(r.user_id, [r.day_of_week]);
    }
    return map;
  }

  static async getScheduleByUserAndDay(userId: number, dayOfWeek: number) {
    const rows = await db
      .select()
      .from(attendance_schedules)
      .where(
        and(
          eq(attendance_schedules.user_id, userId),
          eq(attendance_schedules.day_of_week, dayOfWeek),
        ),
      )
      .limit(1);
    return rows[0] ?? null;
  }

  static async getAllWithUsers(): Promise<UserScheduleDto[]> {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role_code: roles.code,
      })
      .from(users)
      .innerJoin(roles, eq(users.role_id, roles.id))
      .orderBy(asc(users.name));

    const allSchedules = await db
      .select()
      .from(attendance_schedules)
      .orderBy(asc(attendance_schedules.day_of_week));

    const scheduleMap = new Map<number, Map<number, boolean>>();
    for (const s of allSchedules) {
      if (!scheduleMap.has(s.user_id)) {
        scheduleMap.set(s.user_id, new Map());
      }
      scheduleMap.get(s.user_id)!.set(s.day_of_week, Boolean(s.is_active));
    }

    return allUsers.map((u) => {
      const userMap = scheduleMap.get(u.id);
      return {
        user_id: u.id,
        user_name: u.name,
        user_email: u.email,
        role_code: u.role_code,
        schedules: Array.from({ length: 7 }, (_, day) => ({
          day_of_week: day,
          is_active: userMap?.get(day) ?? false,
        })),
      };
    });
  }

  static async getByUserId(userId: number): Promise<UserScheduleDto | null> {
    const userRow = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role_code: roles.code,
      })
      .from(users)
      .innerJoin(roles, eq(users.role_id, roles.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (userRow.length === 0) return null;

    const rows = await db
      .select()
      .from(attendance_schedules)
      .where(eq(attendance_schedules.user_id, userId))
      .orderBy(asc(attendance_schedules.day_of_week));

    const map = new Map(rows.map((r) => [r.day_of_week, Boolean(r.is_active)]));
    const u = userRow[0];

    return {
      user_id: u.id,
      user_name: u.name,
      user_email: u.email,
      role_code: u.role_code,
      schedules: Array.from({ length: 7 }, (_, day) => ({
        day_of_week: day,
        is_active: map.get(day) ?? false,
      })),
    };
  }

  static async upsertUserSchedule(
    userId: number,
    schedules: ScheduleDayDto[],
  ): Promise<UserScheduleDto | null> {
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) return null;

    await db.transaction(async (tx) => {
      if (schedules.some((s) => s.is_active)) {
        await tx
          .update(attendance_schedules)
          .set({ is_active: false, updated_at: new Date() })
          .where(eq(attendance_schedules.user_id, userId));
      }

      for (const item of schedules) {
        const existing = await tx
          .select({ id: attendance_schedules.id })
          .from(attendance_schedules)
          .where(
            and(
              eq(attendance_schedules.user_id, userId),
              eq(attendance_schedules.day_of_week, item.day_of_week),
            ),
          )
          .limit(1);

        if (existing.length > 0) {
          await tx
            .update(attendance_schedules)
            .set({ is_active: item.is_active, updated_at: new Date() })
            .where(eq(attendance_schedules.id, existing[0].id));
        } else {
          await tx.insert(attendance_schedules).values({
            user_id: userId,
            day_of_week: item.day_of_week,
            is_active: item.is_active,
          });
        }
      }
    });

    return AttendanceScheduleRepository.getByUserId(userId);
  }
}
