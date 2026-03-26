import { db } from "../../../db";
import { positions } from "../../../db/schema";
import { eq } from "drizzle-orm";

export class PositionModel {
  // Get all positions
  static async getAllPositions() {
    try {
      const result = await db.select().from(positions);
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch positions: ${error}`);
    }
  }

  // Get position by ID
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

  // Create position
  static async createPosition(data: {
    category: string;
    des?: string;
  }) {
    try {
      const result = await db.insert(positions).values(data);
      return result;
    } catch (error) {
      throw new Error(`Failed to create position: ${error}`);
    }
  }

  // Update position
  static async updatePosition(
    id: number,
    data: Partial<{
      category: string;
      des: string;
    }>
  ) {
    try {
      const result = await db
        .update(positions)
        .set({
          ...data,
          updated_at: new Date(),
        })
        .where(eq(positions.id, id));
      return result;
    } catch (error) {
      throw new Error(`Failed to update position: ${error}`);
    }
  }

  // Delete position
  static async deletePosition(id: number) {
    try {
      const result = await db.delete(positions).where(eq(positions.id, id));
      return result;
    } catch (error) {
      throw new Error(`Failed to delete position: ${error}`);
    }
  }
}
