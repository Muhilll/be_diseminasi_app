import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { disseminations } from "../../../db/schema";
import {
  CreateDisseminationRequestDto,
  UpdateDisseminationRequestDto,
} from "../dto/dissemination-request.dto";

export class DisseminationWriteRepository {
  static async createDissemination(data: CreateDisseminationRequestDto) {
    try {
      return await db.insert(disseminations).values(data);
    } catch (error) {
      throw new Error(`Failed to create dissemination: ${error}`);
    }
  }

  static async updateDissemination(
    id: number,
    data: UpdateDisseminationRequestDto,
  ) {
    try {
      return await db
        .update(disseminations)
        .set({
          ...data,
          updated_at: new Date(),
        })
        .where(eq(disseminations.id, id));
    } catch (error) {
      throw new Error(`Failed to update dissemination: ${error}`);
    }
  }

  static async deleteDissemination(id: number) {
    try {
      return await db.delete(disseminations).where(eq(disseminations.id, id));
    } catch (error) {
      throw new Error(`Failed to delete dissemination: ${error}`);
    }
  }
}
