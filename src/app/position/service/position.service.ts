import {
  CreatePositionRequestDto,
  UpdatePositionRequestDto,
} from "../dto/position-request.dto";
import { PositionResponseDto } from "../dto/position-response.dto";
import { PositionReadRepository } from "../repository/position-read.repository";
import { PositionWriteRepository } from "../repository/position-write.repository";

export class PositionService {
  static async getAllPositions(): Promise<PositionResponseDto[]> {
    return PositionReadRepository.getAllPositions();
  }

  static async getPositionById(
    id: number,
  ): Promise<PositionResponseDto | null> {
    return PositionReadRepository.getPositionById(id);
  }

  static async createPosition(payload: CreatePositionRequestDto) {
    return PositionWriteRepository.createPosition(payload);
  }

  static async updatePosition(id: number, payload: UpdatePositionRequestDto) {
    const position = await PositionReadRepository.getPositionById(id);

    if (!position) {
      return null;
    }

    const result = await PositionWriteRepository.updatePosition(id, payload);
    return { position, result };
  }

  static async deletePosition(id: number) {
    const position = await PositionReadRepository.getPositionById(id);

    if (!position) {
      return null;
    }

    const result = await PositionWriteRepository.deletePosition(id);
    return { position, result };
  }
}
