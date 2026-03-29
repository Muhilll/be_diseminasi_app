import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { grades } from "../../../db/schema";

export class GradeReadRepository {
  static async getAllGrades() {
    try {
      return await db.select().from(grades);
    } catch (error) {
      throw new Error(`Failed to fetch grades: ${error}`);
    }
  }

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
}
