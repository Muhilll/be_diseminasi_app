import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { positions } from "../../../db/schema";

export class PositionReadRepository {
  static async getAllPositions() {
    try {
      return await db.select().from(positions);
    } catch (error) {
      throw new Error(`Failed to fetch positions: ${error}`);
    }
  }

  static async getPositionById(id: number) {
    try {
      const result = await db
        .select()
        .from(positions)
        .where(eq(positions.id, id))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch position: ${error}`);
    }
  }
}
