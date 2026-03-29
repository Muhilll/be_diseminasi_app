import {
  CreateDisseminationDetailRequestDto,
  UpdateDisseminationDetailRequestDto,
} from "../dto/dissemination-detail-request.dto";
import { DisseminationDetailResponseDto } from "../dto/dissemination-detail-response.dto";
import { DisseminationDetailReadRepository } from "../repository/dissemination-detail-read.repository";
import { DisseminationDetailWriteRepository } from "../repository/dissemination-detail-write.repository";

export class DisseminationDetailService {
  static async getAllDisseminationDetails(): Promise<
    DisseminationDetailResponseDto[]
  > {
    return DisseminationDetailReadRepository.getAllDisseminationDetails();
  }

  static async getDisseminationDetailById(
    id: number,
  ): Promise<DisseminationDetailResponseDto | null> {
    return DisseminationDetailReadRepository.getDisseminationDetailById(id);
  }

  static async getDetailsByDisseminationId(
    disseminationId: number,
  ): Promise<DisseminationDetailResponseDto[]> {
    return DisseminationDetailReadRepository.getDetailsByDisseminationId(
      disseminationId,
    );
  }

  static async createDisseminationDetail(
    payload: CreateDisseminationDetailRequestDto,
  ) {
    return DisseminationDetailWriteRepository.createDisseminationDetail(payload);
  }

  static async updateDisseminationDetail(
    id: number,
    payload: UpdateDisseminationDetailRequestDto,
  ) {
    const detail =
      await DisseminationDetailReadRepository.getDisseminationDetailById(id);

    if (!detail) {
      return null;
    }

    const result = await DisseminationDetailWriteRepository.updateDisseminationDetail(
      id,
      payload,
    );

    return { detail, result };
  }

  static async deleteDisseminationDetail(id: number) {
    const detail =
      await DisseminationDetailReadRepository.getDisseminationDetailById(id);

    if (!detail) {
      return null;
    }

    const result = await DisseminationDetailWriteRepository.deleteDisseminationDetail(
      id,
    );

    return { detail, result };
  }
}
