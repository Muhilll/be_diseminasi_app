import { db } from "../../../db";
import { disseminations, users } from "../../../db/schema";
import { eq } from "drizzle-orm";

type DisseminationWithRelationsRow = {
  id: number;
  title: string;
  province: string;
  city: string;
  district: string;
  village: string;
  date: Date;
  user_id: number;
  created_at: Date;
  updated_at: Date;
  user_ref_id: number;
  user_email: string;
  user_employee_id: string | null;
  user_name: string;
  user_grade_id: number;
  user_position_id: number;
  user_signature_image: string | null;
  user_role_id: number;
};

type PublicDissemination = {
  id: number;
  title: string;
  province: string;
  city: string;
  district: string;
  village: string;
  date: Date;
  user_id: number;
  created_at: Date;
  updated_at: Date;
  user: {
    id: number;
    email: string;
    employee_id: string | null;
    name: string;
    grade_id: number;
    position_id: number;
    signature_image: string | null;
    role_id: number;
  };
};

export class DisseminationModel {
  private static mapDissemination(
    dissemination: DisseminationWithRelationsRow,
  ): PublicDissemination {
    return {
      id: dissemination.id,
      title: dissemination.title,
      province: dissemination.province,
      city: dissemination.city,
      district: dissemination.district,
      village: dissemination.village,
      date: dissemination.date,
      user_id: dissemination.user_id,
      created_at: dissemination.created_at,
      updated_at: dissemination.updated_at,
      user: {
        id: dissemination.user_ref_id,
        email: dissemination.user_email,
        employee_id: dissemination.user_employee_id,
        name: dissemination.user_name,
        grade_id: dissemination.user_grade_id,
        position_id: dissemination.user_position_id,
        signature_image: dissemination.user_signature_image,
        role_id: dissemination.user_role_id,
      },
    };
  }

  // Get all disseminations
  static async getAllDisseminations() {
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
        .innerJoin(users, eq(disseminations.user_id, users.id));

      return result.map((item) => this.mapDissemination(item));
    } catch (error) {
      throw new Error(`Failed to fetch disseminations: ${error}`);
    }
  }

  // Get dissemination by ID
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

      return result[0] ? this.mapDissemination(result[0]) : null;
    } catch (error) {
      throw new Error(`Failed to fetch dissemination: ${error}`);
    }
  }

  // Get disseminations by user ID
  static async getDisseminationsByUserId(userId: number) {
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
        .where(eq(disseminations.user_id, userId));

      return result.map((item) => this.mapDissemination(item));
    } catch (error) {
      throw new Error(`Failed to fetch disseminations: ${error}`);
    }
  }

  // Create dissemination
  static async createDissemination(data: {
    title: string;
    province: string;
    city: string;
    district: string;
    village: string;
    date: Date;
    user_id: number;
  }) {
    try {
      const result = await db.insert(disseminations).values(data);
      return result;
    } catch (error) {
      throw new Error(`Failed to create dissemination: ${error}`);
    }
  }

  // Update dissemination
  static async updateDissemination(
    id: number,
    data: Partial<{
      title: string;
      province: string;
      city: string;
      district: string;
      village: string;
      date: Date;
      user_id: number;
    }>
  ) {
    try {
      const result = await db
        .update(disseminations)
        .set({
          ...data,
          updated_at: new Date(),
        })
        .where(eq(disseminations.id, id));
      return result;
    } catch (error) {
      throw new Error(`Failed to update dissemination: ${error}`);
    }
  }

  // Delete dissemination
  static async deleteDissemination(id: number) {
    try {
      const result = await db
        .delete(disseminations)
        .where(eq(disseminations.id, id));
      return result;
    } catch (error) {
      throw new Error(`Failed to delete dissemination: ${error}`);
    }
  }
}
