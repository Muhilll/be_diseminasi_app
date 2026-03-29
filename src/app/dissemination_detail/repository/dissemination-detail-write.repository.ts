import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { disseminations_details } from "../../../db/schema";
import {
  CreateDisseminationDetailRequestDto,
  UpdateDisseminationDetailRequestDto,
} from "../dto/dissemination-detail-request.dto";

export class DisseminationDetailWriteRepository {
  static async createDisseminationDetail(
    data: CreateDisseminationDetailRequestDto,
  ) {
    try {
      return await db.insert(disseminations_details).values(data);
    } catch (error) {
      throw new Error(`Failed to create dissemination detail: ${error}`);
    }
  }

  static async updateDisseminationDetail(
    id: number,
    data: UpdateDisseminationDetailRequestDto,
  ) {
    try {
      return await db
        .update(disseminations_details)
        .set({
          ...data,
          updated_at: new Date(),
        })
        .where(eq(disseminations_details.id, id));
    } catch (error) {
      throw new Error(`Failed to update dissemination detail: ${error}`);
    }
  }

  static async deleteDisseminationDetail(id: number) {
    try {
      return await db
        .delete(disseminations_details)
        .where(eq(disseminations_details.id, id));
    } catch (error) {
      throw new Error(`Failed to delete dissemination detail: ${error}`);
    }
  }
}
