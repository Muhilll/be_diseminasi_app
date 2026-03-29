import {
  CreateGradeRequestDto,
  UpdateGradeRequestDto,
} from "../dto/grade-request.dto";
import { GradeResponseDto } from "../dto/grade-response.dto";
import { GradeReadRepository } from "../repository/grade-read.repository";
import { GradeWriteRepository } from "../repository/grade-write.repository";

export class GradeService {
  static async getAllGrades(): Promise<GradeResponseDto[]> {
    return GradeReadRepository.getAllGrades();
  }

  static async getGradeById(id: number): Promise<GradeResponseDto | null> {
    return GradeReadRepository.getGradeById(id);
  }

  static async createGrade(payload: CreateGradeRequestDto) {
    return GradeWriteRepository.createGrade(payload);
  }

  static async updateGrade(id: number, payload: UpdateGradeRequestDto) {
    const grade = await GradeReadRepository.getGradeById(id);

    if (!grade) {
      return null;
    }

    const result = await GradeWriteRepository.updateGrade(id, payload);
    return { grade, result };
  }

  static async deleteGrade(id: number) {
    const grade = await GradeReadRepository.getGradeById(id);

    if (!grade) {
      return null;
    }

    const result = await GradeWriteRepository.deleteGrade(id);
    return { grade, result };
  }
}
