import { DisseminationWithRelationsRow } from "../contract/dissemination.contract";
import {
  CreateDisseminationRequestDto,
  UpdateDisseminationRequestDto,
} from "../dto/dissemination-request.dto";
import { DisseminationResponseDto } from "../dto/dissemination-response.dto";
import { DisseminationReadRepository } from "../repository/dissemination-read.repository";
import { DisseminationWriteRepository } from "../repository/dissemination-write.repository";

export class DisseminationService {
  private static mapDissemination(
    dissemination: DisseminationWithRelationsRow,
  ): DisseminationResponseDto {
    return {
      id: dissemination.id,
      title: dissemination.title,
      province: dissemination.province,
      city: dissemination.city,
      district: dissemination.district,
      village: dissemination.village,
      date: dissemination.date,
      user_id: dissemination.user_id,
      created_at: dissemination.created_at,
      updated_at: dissemination.updated_at,
      user: {
        id: dissemination.user_ref_id,
        email: dissemination.user_email,
        employee_id: dissemination.user_employee_id,
        name: dissemination.user_name,
        grade_id: dissemination.user_grade_id,
        position_id: dissemination.user_position_id,
        signature_image: dissemination.user_signature_image,
        role_id: dissemination.user_role_id,
      },
    };
  }

  static async getAllDisseminations(): Promise<DisseminationResponseDto[]> {
    const result = await DisseminationReadRepository.getAllDisseminations();
    return result.map((item) => DisseminationService.mapDissemination(item));
  }

  static async getDisseminationById(
    id: number,
  ): Promise<DisseminationResponseDto | null> {
    const result = await DisseminationReadRepository.getDisseminationById(id);

    if (!result) {
      return null;
    }

    return DisseminationService.mapDissemination(result);
  }

  static async getDisseminationsByUserId(
    userId: number,
  ): Promise<DisseminationResponseDto[]> {
    const result = await DisseminationReadRepository.getDisseminationsByUserId(
      userId,
    );

    return result.map((item) => DisseminationService.mapDissemination(item));
  }

  static async createDissemination(payload: CreateDisseminationRequestDto) {
    return DisseminationWriteRepository.createDissemination(payload);
  }

  static async updateDissemination(
    id: number,
    payload: UpdateDisseminationRequestDto,
  ) {
    const dissemination = await DisseminationReadRepository.getDisseminationById(
      id,
    );

    if (!dissemination) {
      return null;
    }

    const result = await DisseminationWriteRepository.updateDissemination(
      id,
      payload,
    );

    return { dissemination, result };
  }

  static async deleteDissemination(id: number) {
    const dissemination = await DisseminationReadRepository.getDisseminationById(
      id,
    );

    if (!dissemination) {
      return null;
    }

    const result = await DisseminationWriteRepository.deleteDissemination(id);
    return { dissemination, result };
  }
}
