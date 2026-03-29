import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { disseminations, users } from "../../../db/schema";
import { DisseminationWithRelationsRow } from "../contract/dissemination.contract";

export class DisseminationReadRepository {
  static async getAllDisseminations() {
    try {
      return await db
        .select({
          id: disseminations.id,
          title: disseminations.title,
          province: disseminations.province,
          city: disseminations.city,
          district: disseminations.district,
          village: disseminations.village,
          date: disseminations.date,
          user_id: disseminations.user_id,
          created_at: disseminations.created_at,
          updated_at: disseminations.updated_at,
          user_ref_id: users.id,
          user_email: users.email,
          user_employee_id: users.employee_id,
          user_name: users.name,
          user_grade_id: users.grade_id,
          user_position_id: users.position_id,
          user_signature_image: users.signature_image,
          user_role_id: users.role_id,
        })
        .from(disseminations)
        .innerJoin(users, eq(disseminations.user_id, users.id));
    } catch (error) {
      throw new Error(`Failed to fetch disseminations: ${error}`);
    }
  }

  static async getDisseminationById(id: number) {
    try {
      const result = await db
        .select({
          id: disseminations.id,
          title: disseminations.title,
          province: disseminations.province,
          city: disseminations.city,
          district: disseminations.district,
          village: disseminations.village,
          date: disseminations.date,
          user_id: disseminations.user_id,
          created_at: disseminations.created_at,
          updated_at: disseminations.updated_at,
          user_ref_id: users.id,
          user_email: users.email,
          user_employee_id: users.employee_id,
          user_name: users.name,
          user_grade_id: users.grade_id,
          user_position_id: users.position_id,
          user_signature_image: users.signature_image,
          user_role_id: users.role_id,
        })
        .from(disseminations)
        .innerJoin(users, eq(disseminations.user_id, users.id))
        .where(eq(disseminations.id, id))
        .limit(1);

      return (result[0] || null) as DisseminationWithRelationsRow | null;
    } catch (error) {
      throw new Error(`Failed to fetch dissemination: ${error}`);
    }
  }

  static async getDisseminationsByUserId(userId: number) {
    try {
      return await db
        .select({
          id: disseminations.id,
          title: disseminations.title,
          province: disseminations.province,
          city: disseminations.city,
          district: disseminations.district,
          village: disseminations.village,
          date: disseminations.date,
          user_id: disseminations.user_id,
          created_at: disseminations.created_at,
          updated_at: disseminations.updated_at,
          user_ref_id: users.id,
          user_email: users.email,
          user_employee_id: users.employee_id,
          user_name: users.name,
          user_grade_id: users.grade_id,
          user_position_id: users.position_id,
          user_signature_image: users.signature_image,
          user_role_id: users.role_id,
        })
        .from(disseminations)
        .innerJoin(users, eq(disseminations.user_id, users.id))
        .where(eq(disseminations.user_id, userId));
    } catch (error) {
      throw new Error(`Failed to fetch disseminations: ${error}`);
    }
  }
}
