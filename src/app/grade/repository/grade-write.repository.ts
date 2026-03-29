import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { grades } from "../../../db/schema";
import {
  CreateGradeRequestDto,
  UpdateGradeRequestDto,
} from "../dto/grade-request.dto";

export class GradeWriteRepository {
  static async createGrade(data: CreateGradeRequestDto) {
    try {
      return await db.insert(grades).values(data);
    } catch (error) {
      throw new Error(`Failed to create grade: ${error}`);
    }
  }

  static async updateGrade(id: number, data: UpdateGradeRequestDto) {
    try {
      return await db
        .update(grades)
        .set({
          ...data,
          updated_at: new Date(),
        })
        .where(eq(grades.id, id));
    } catch (error) {
      throw new Error(`Failed to update grade: ${error}`);
    }
  }

  static async deleteGrade(id: number) {
    try {
      return await db.delete(grades).where(eq(grades.id, id));
    } catch (error) {
      throw new Error(`Failed to delete grade: ${error}`);
    }
  }
}
