import { eq } from "drizzle-orm";
import { attendances, db } from "../../../db";

export type CreateAttendanceCheckInData = {
  user_id: number;
  attendance_date: string;
  check_in_time: Date;
  check_in_lat: number;
  check_in_lng: number;
  check_in_image: string;
  check_in_image_public_id: string;
  check_in_note?: string | null;
  check_in_status: "on_time" | "late" | "outside_radius" | "late_outside_radius";
};

export type UpdateAttendanceCheckOutData = {
  check_out_time: Date;
  check_out_lat: number;
  check_out_lng: number;
  check_out_image: string;
  check_out_image_public_id: string;
  check_out_note?: string | null;
  check_out_status: "on_time" | "late_checkout" | "outside_radius" | "late_outside_radius";
};

export class AttendanceWriteRepository {
  static async createCheckIn(data: CreateAttendanceCheckInData) {
    return db.insert(attendances).values({
      user_id: data.user_id,
      attendance_date: data.attendance_date,
      check_in_time: data.check_in_time,
      check_in_lat: data.check_in_lat,
      check_in_lng: data.check_in_lng,
      check_in_image: data.check_in_image,
      check_in_image_public_id: data.check_in_image_public_id,
      check_in_note: data.check_in_note ?? null,
      check_in_status: data.check_in_status,
    });
  }

  static async updateCheckOut(id: number, data: UpdateAttendanceCheckOutData) {
    return db
      .update(attendances)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(attendances.id, id));
  }

  static async deleteById(id: number) {
    return db.delete(attendances).where(eq(attendances.id, id));
  }
}
