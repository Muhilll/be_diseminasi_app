import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { positions } from "../../../db/schema";
import {
  CreatePositionRequestDto,
  UpdatePositionRequestDto,
} from "../dto/position-request.dto";

export class PositionWriteRepository {
  static async createPosition(data: CreatePositionRequestDto) {
    try {
      return await db.insert(positions).values(data);
    } catch (error) {
      throw new Error(`Failed to create position: ${error}`);
    }
  }

  static async updatePosition(id: number, data: UpdatePositionRequestDto) {
    try {
      return await db
        .update(positions)
        .set({
          ...data,
          updated_at: new Date(),
        })
        .where(eq(positions.id, id));
    } catch (error) {
      throw new Error(`Failed to update position: ${error}`);
    }
  }

  static async deletePosition(id: number) {
    try {
      return await db.delete(positions).where(eq(positions.id, id));
    } catch (error) {
      throw new Error(`Failed to delete position: ${error}`);
    }
  }
}
