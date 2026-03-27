import { db } from "../../../db";
import { disseminations_details } from "../../../db/schema";
import { eq } from "drizzle-orm";

export class DisseminationDetailModel {
  // Get all dissemination details
  static async getAllDisseminationDetails() {
    try {
      const result = await db.select().from(disseminations_details);
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch dissemination details: ${error}`);
    }
  }

  // Get dissemination detail by ID
  static async getDisseminationDetailById(id: number) {
    try {
      const result = await db
        .select()
        .from(disseminations_details)
        .where(eq(disseminations_details.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch dissemination detail: ${error}`);
    }
  }

  // Get details by dissemination ID
  static async getDetailsByDisseminationId(disseminationId: number) {
    try {
      const result = await db
        .select()
        .from(disseminations_details)
        .where(eq(disseminations_details.disseminations_id, disseminationId));
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch dissemination details: ${error}`);
    }
  }

  // Create dissemination detail
  static async createDisseminationDetail(data: {
    disseminations_id: number;
    basis?: string;
    material?: string;
    date?: Date;
    location?: string;
    methode?: string;
    participants?: string;
    result?: string;
    image?: string;
  }) {
    try {
      const result = await db.insert(disseminations_details).values(data);
      return result;
    } catch (error) {
      throw new Error(`Failed to create dissemination detail: ${error}`);
    }
  }

  // Update dissemination detail
  static async updateDisseminationDetail(
    id: number,
    data: Partial<{
      disseminations_id: number;
      basis: string;
      material: string;
      date: Date;
      location: string;
      methode: string;
      participants: string;
      result: string;
      image: string;
    }>
  ) {
    try {
      const result = await db
        .update(disseminations_details)
        .set({
          ...data,
          updated_at: new Date(),
        })
        .where(eq(disseminations_details.id, id));
      return result;
    } catch (error) {
      throw new Error(`Failed to update dissemination detail: ${error}`);
    }
  }

  // Delete dissemination detail
  static async deleteDisseminationDetail(id: number) {
    try {
      const result = await db
        .delete(disseminations_details)
        .where(eq(disseminations_details.id, id));
      return result;
    } catch (error) {
      throw new Error(`Failed to delete dissemination detail: ${error}`);
    }
  }
}
