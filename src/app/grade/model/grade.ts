import { db } from "../../../db";
import { grades } from "../../../db/schema";
import { eq } from "drizzle-orm";

export class GradeModel {
  // Get all grades
  static async getAllGrades() {
    try {
      const result = await db.select().from(grades);
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch grades: ${error}`);
    }
  }

  // Get grade by ID
  static async getGradeById(id: number) {
    try {
      const result = await db
        .select()
        .from(grades)
        .where(eq(grades.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch grade: ${error}`);
    }
  }

  // Create grade
  static async createGrade(data: {
    level: number;
    grade: string;
    des?: string;
  }) {
    try {
      const result = await db.insert(grades).values(data);
      return result;
    } catch (error) {
      throw new Error(`Failed to create grade: ${error}`);
    }
  }

  // Update grade
  static async updateGrade(
    id: number,
    data: Partial<{
      level: number;
      grade: string;
      des: string;
    }>
  ) {
    try {
      const result = await db
        .update(grades)
        .set({
          ...data,
          updated_at: new Date(),
        })
        .where(eq(grades.id, id));
      return result;
    } catch (error) {
      throw new Error(`Failed to update grade: ${error}`);
    }
  }

  // Delete grade
  static async deleteGrade(id: number) {
    try {
      const result = await db.delete(grades).where(eq(grades.id, id));
      return result;
    } catch (error) {
      throw new Error(`Failed to delete grade: ${error}`);
    }
  }
}
