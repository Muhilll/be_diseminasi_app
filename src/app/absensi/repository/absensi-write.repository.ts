import { eq } from "drizzle-orm";
import { absensis, db } from "../../../db";
import {
  CreateAbsensiRequestDto,
  UpdateAbsensiRequestDto,
} from "../dto/absensi-request.dto";

export class AbsensiWriteRepository {
  static async createAbsensi(data: CreateAbsensiRequestDto) {
    try {
      return await db.insert(absensis).values(data);
    } catch (error) {
      throw new Error(`Failed to create absensi: ${error}`);
    }
  }

  static async updateAbsensi(id: number, data: UpdateAbsensiRequestDto) {
    try {
      return await db
        .update(absensis)
        .set({
          ...data,
          updated_at: new Date(),
        })
        .where(eq(absensis.id, id));
    } catch (error) {
      throw new Error(`Failed to update absensi: ${error}`);
    }
  }

  static async deleteAbsensi(id: number) {
    try {
      return await db.delete(absensis).where(eq(absensis.id, id));
    } catch (error) {
      throw new Error(`Failed to delete absensi: ${error}`);
    }
  }
}
