import { db } from "../../../db";
import { disseminations } from "../../../db/schema";
import { eq } from "drizzle-orm";

export class DisseminationModel {
  // Get all disseminations
  static async getAllDisseminations() {
    try {
      const result = await db.select().from(disseminations);
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch disseminations: ${error}`);
    }
  }

  // Get dissemination by ID
  static async getDisseminationById(id: number) {
    try {
      const result = await db
        .select()
        .from(disseminations)
        .where(eq(disseminations.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch dissemination: ${error}`);
    }
  }

  // Get disseminations by user ID
  static async getDisseminationsByUserId(userId: number) {
    try {
      const result = await db
        .select()
        .from(disseminations)
        .where(eq(disseminations.user_id, userId));
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch disseminations: ${error}`);
    }
  }

  // Create dissemination
  static async createDissemination(data: {
    title: string;
    month: number;
    year: number;
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
      month: number;
      year: number;
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
