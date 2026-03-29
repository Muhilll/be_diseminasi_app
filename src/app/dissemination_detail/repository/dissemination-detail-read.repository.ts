import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { disseminations_details } from "../../../db/schema";

export class DisseminationDetailReadRepository {
  static async getAllDisseminationDetails() {
    try {
      return await db.select().from(disseminations_details);
    } catch (error) {
      throw new Error(`Failed to fetch dissemination details: ${error}`);
    }
  }

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

  static async getDetailsByDisseminationId(disseminationId: number) {
    try {
      return await db
        .select()
        .from(disseminations_details)
        .where(eq(disseminations_details.disseminations_id, disseminationId));
    } catch (error) {
      throw new Error(`Failed to fetch dissemination details: ${error}`);
    }
  }
}
