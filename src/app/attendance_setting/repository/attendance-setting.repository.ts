import { eq } from "drizzle-orm";
import { attendance_settings, db } from "../../../db";

export type AttendanceSettingRow = typeof attendance_settings.$inferSelect;

export type UpdateAttendanceSettingDto = {
  location_name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  check_in_deadline: string;
  check_out_deadline: string;
};

export class AttendanceSettingRepository {
  static async getSetting(): Promise<AttendanceSettingRow | null> {
    const rows = await db.select().from(attendance_settings).limit(1);
    return rows[0] ?? null;
  }

  static async upsertSetting(
    data: UpdateAttendanceSettingDto,
  ): Promise<AttendanceSettingRow> {
    const existing = await AttendanceSettingRepository.getSetting();
    if (!existing) {
      await db.insert(attendance_settings).values(data);
    } else {
      await db
        .update(attendance_settings)
        .set({ ...data, updated_at: new Date() })
        .where(eq(attendance_settings.id, existing.id));
    }

    const updated = await AttendanceSettingRepository.getSetting();
    if (!updated) {
      throw new Error("Failed to load updated attendance setting");
    }
    return updated;
  }
}
