import { AbsensiWithRelationsRow } from "../contract/absensi.contract";
import {
  CreateAbsensiRequestDto,
  UpdateAbsensiRequestDto,
} from "../dto/absensi-request.dto";
import { AbsensiResponseDto } from "../dto/absensi-response.dto";
import { AbsensiReadRepository } from "../repository/absensi-read.repository";
import { AbsensiWriteRepository } from "../repository/absensi-write.repository";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "../../../utils/cloudinary";

export class AbsensiService {
  private static mapAbsensi(absensi: AbsensiWithRelationsRow): AbsensiResponseDto {
    return {
      id: absensi.id,
      gambar: absensi.gambar,
      gambar_public_id: absensi.gambar_public_id,
      des: absensi.des,
      user_id: absensi.user_id,
      created_at: absensi.created_at,
      updated_at: absensi.updated_at,
      user: {
        id: absensi.user_ref_id,
        email: absensi.user_email,
        employee_id: absensi.user_employee_id,
        name: absensi.user_name,
        grade_id: absensi.user_grade_id,
        position_id: absensi.user_position_id,
        signature_image: absensi.user_signature_image,
        role_id: absensi.user_role_id,
      },
    };
  }

  static async getAllAbsensis(): Promise<AbsensiResponseDto[]> {
    const result = await AbsensiReadRepository.getAllAbsensis();
    return result.map((item) => AbsensiService.mapAbsensi(item));
  }

  static async getAbsensiById(id: number): Promise<AbsensiResponseDto | null> {
    const result = await AbsensiReadRepository.getAbsensiById(id);

    if (!result) {
      return null;
    }

    return AbsensiService.mapAbsensi(result);
  }

  static async getAbsensisByUserId(
    userId: number,
  ): Promise<AbsensiResponseDto[]> {
    const result = await AbsensiReadRepository.getAbsensisByUserId(userId);
    return result.map((item) => AbsensiService.mapAbsensi(item));
  }

  static async createAbsensi(payload: CreateAbsensiRequestDto) {
    const uploadedImage = await uploadImageToCloudinary(
      payload.gambar,
      "absensi",
      "absensi",
    );

    return AbsensiWriteRepository.createAbsensi({
      ...payload,
      gambar_public_id: "",
      ...(uploadedImage !== undefined
        ? {
            gambar: uploadedImage.secure_url,
            gambar_public_id: uploadedImage.public_id,
          }
        : {}),
    });
  }

  static async updateAbsensi(id: number, payload: UpdateAbsensiRequestDto) {
    const absensi = await AbsensiReadRepository.getAbsensiById(id);

    if (!absensi) {
      return null;
    }

    const uploadedImage =
      payload.gambar !== undefined
        ? await uploadImageToCloudinary(
            payload.gambar,
            "absensi",
            "absensi",
          )
        : undefined;

    if (payload.gambar !== undefined && absensi.gambar_public_id) {
      await deleteImageFromCloudinary(absensi.gambar_public_id, "absensi");
    }

    const result = await AbsensiWriteRepository.updateAbsensi(id, {
      ...payload,
      ...(uploadedImage !== undefined
        ? {
            gambar: uploadedImage.secure_url,
            gambar_public_id: uploadedImage.public_id,
          }
        : {}),
    });
    return { absensi, result };
  }


  static async deleteAbsensi(id: number) {
    const absensi = await AbsensiReadRepository.getAbsensiById(id);

    if (!absensi) {
      return null;
    }

    await deleteImageFromCloudinary(absensi.gambar_public_id, "absensi");

    const result = await AbsensiWriteRepository.deleteAbsensi(id);
    return { absensi, result };
  }
}
