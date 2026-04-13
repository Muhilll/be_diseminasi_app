import { eq } from "drizzle-orm";
import { absensis, db } from "../../../db";
import {
  CreateAbsensiRequestDto,
  UpdateAbsensiRequestDto,
} from "../dto/absensi-request.dto";

export class AbsensiWriteRepository {
  static async createAbsensi(data: CreateAbsensiRequestDto) {
    try {
      return await db.insert(absensis).values({
        user_id: data.user_id,
        des: data.des,
        ...(typeof data.gambar === "string" ? { gambar: data.gambar } : {}),
        gambar_public_id: data.gambar_public_id ?? "",
      });
    } catch (error) {
      throw new Error(`Failed to create absensi: ${error}`);
    }
  }

  static async updateAbsensi(id: number, data: UpdateAbsensiRequestDto) {
    try {
      const updateData = {
        ...(data.user_id !== undefined ? { user_id: data.user_id } : {}),
        ...(data.des !== undefined ? { des: data.des } : {}),
        ...(typeof data.gambar === "string" ? { gambar: data.gambar } : {}),
        ...(typeof data.gambar_public_id === "string"
          ? { gambar_public_id: data.gambar_public_id }
          : {}),
        updated_at: new Date(),
      };

      return await db
        .update(absensis)
        .set(updateData)
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
