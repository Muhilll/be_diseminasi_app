import {
  CreateDisseminationDetailRequestDto,
  UpdateDisseminationDetailRequestDto,
} from "../dto/dissemination-detail-request.dto";
import { DisseminationDetailResponseDto } from "../dto/dissemination-detail-response.dto";
import { DisseminationDetailReadRepository } from "../repository/dissemination-detail-read.repository";
import { DisseminationDetailWriteRepository } from "../repository/dissemination-detail-write.repository";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "../../../utils/cloudinary";

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
    const uploadedImage = await uploadImageToCloudinary(
      payload.image,
      "disseminations",
      "dissemination_details",
    );

    return DisseminationDetailWriteRepository.createDisseminationDetail({
      ...payload,
      ...(uploadedImage !== undefined
        ? {
            image: uploadedImage.secure_url,
            image_public_id: uploadedImage.public_id || null,
          }
        : {}),
    });
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

    const uploadedImage =
      payload.image !== undefined
        ? await uploadImageToCloudinary(
            payload.image,
            "disseminations",
            "dissemination_details",
          )
        : undefined;

    if (payload.image !== undefined && detail.image_public_id) {
      await deleteImageFromCloudinary(
        detail.image_public_id,
        "dissemination_details",
      );
    }

    const result =
      await DisseminationDetailWriteRepository.updateDisseminationDetail(id, {
        ...payload,
        ...(uploadedImage !== undefined
          ? {
              image: uploadedImage.secure_url,
              image_public_id: uploadedImage.public_id || null,
            }
          : {}),
      });

    return { detail, result };
  }

  static async deleteDisseminationDetail(id: number) {
    const detail =
      await DisseminationDetailReadRepository.getDisseminationDetailById(id);

    if (!detail) {
      return null;
    }

    await deleteImageFromCloudinary(
      detail.image_public_id,
      "dissemination_details",
    );

    const result = await DisseminationDetailWriteRepository.deleteDisseminationDetail(
      id,
    );

    return { detail, result };
  }
}
