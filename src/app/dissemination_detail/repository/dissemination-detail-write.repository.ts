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
      return await db.insert(disseminations_details).values({
        disseminations_id: data.disseminations_id,
        basis: data.basis,
        material: data.material,
        date: data.date,
        location: data.location,
        methode: data.methode,
        participants: data.participants,
        result: data.result,
        ...(typeof data.image === "string" ? { image: data.image } : {}),
        image_public_id: data.image_public_id ?? "",
      });
    } catch (error) {
      throw new Error(`Failed to create dissemination detail: ${error}`);
    }
  }

  static async updateDisseminationDetail(
    id: number,
    data: UpdateDisseminationDetailRequestDto,
  ) {
    try {
      const updateData = {
        ...(data.disseminations_id !== undefined
          ? { disseminations_id: data.disseminations_id }
          : {}),
        ...(data.basis !== undefined ? { basis: data.basis } : {}),
        ...(data.material !== undefined ? { material: data.material } : {}),
        ...(data.date !== undefined ? { date: data.date } : {}),
        ...(data.location !== undefined ? { location: data.location } : {}),
        ...(data.methode !== undefined ? { methode: data.methode } : {}),
        ...(data.participants !== undefined
          ? { participants: data.participants }
          : {}),
        ...(data.result !== undefined ? { result: data.result } : {}),
        ...(typeof data.image === "string" ? { image: data.image } : {}),
        ...(typeof data.image_public_id === "string"
          ? { image_public_id: data.image_public_id }
          : {}),
        updated_at: new Date(),
      };

      return await db
        .update(disseminations_details)
        .set(updateData)
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
