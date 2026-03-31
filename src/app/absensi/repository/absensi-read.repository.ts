import { desc, eq } from "drizzle-orm";
import { absensis, db, users } from "../../../db";
import { AbsensiWithRelationsRow } from "../contract/absensi.contract";

export class AbsensiReadRepository {
  static async getAllAbsensis() {
    try {
      return await db
        .select({
          id: absensis.id,
          gambar: absensis.gambar,
          gambar_public_id: absensis.gambar_public_id,
          des: absensis.des,
          user_id: absensis.user_id,
          created_at: absensis.created_at,
          updated_at: absensis.updated_at,
          user_ref_id: users.id,
          user_email: users.email,
          user_employee_id: users.employee_id,
          user_name: users.name,
          user_grade_id: users.grade_id,
          user_position_id: users.position_id,
          user_signature_image: users.signature_image,
          user_role_id: users.role_id,
        })
        .from(absensis)
        .innerJoin(users, eq(absensis.user_id, users.id))
        .orderBy(desc(absensis.created_at));
    } catch (error) {
      throw new Error(`Failed to fetch absensis: ${error}`);
    }
  }

  static async getAbsensiById(id: number) {
    try {
      const result = await db
        .select({
          id: absensis.id,
          gambar: absensis.gambar,
          gambar_public_id: absensis.gambar_public_id,
          des: absensis.des,
          user_id: absensis.user_id,
          created_at: absensis.created_at,
          updated_at: absensis.updated_at,
          user_ref_id: users.id,
          user_email: users.email,
          user_employee_id: users.employee_id,
          user_name: users.name,
          user_grade_id: users.grade_id,
          user_position_id: users.position_id,
          user_signature_image: users.signature_image,
          user_role_id: users.role_id,
        })
        .from(absensis)
        .innerJoin(users, eq(absensis.user_id, users.id))
        .where(eq(absensis.id, id))
        .limit(1);

      return (result[0] || null) as AbsensiWithRelationsRow | null;
    } catch (error) {
      throw new Error(`Failed to fetch absensi: ${error}`);
    }
  }

  static async getAbsensisByUserId(userId: number) {
    try {
      return await db
        .select({
          id: absensis.id,
          gambar: absensis.gambar,
          gambar_public_id: absensis.gambar_public_id,
          des: absensis.des,
          user_id: absensis.user_id,
          created_at: absensis.created_at,
          updated_at: absensis.updated_at,
          user_ref_id: users.id,
          user_email: users.email,
          user_employee_id: users.employee_id,
          user_name: users.name,
          user_grade_id: users.grade_id,
          user_position_id: users.position_id,
          user_signature_image: users.signature_image,
          user_role_id: users.role_id,
        })
        .from(absensis)
        .innerJoin(users, eq(absensis.user_id, users.id))
        .where(eq(absensis.user_id, userId))
        .orderBy(desc(absensis.created_at));
    } catch (error) {
      throw new Error(`Failed to fetch absensis: ${error}`);
    }
  }
}
