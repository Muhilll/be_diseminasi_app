import { Context } from "hono";
import {
  CreateAbsensiRequestDto,
  UpdateAbsensiRequestDto,
} from "../dto/absensi-request.dto";
import { AbsensiService } from "../service/absensi.service";

type ParsedAbsensiId =
  | { success: true; id: number }
  | { success: false; error: string };

type ParsedUserId =
  | { success: true; userId: number }
  | { success: false; error: string };

export class AbsensiController {
  private static validateImagePayload(
    imageUrl: string | undefined,
    imagePublicId: string | undefined,
  ) {
    if (!imageUrl && !imagePublicId) {
      return null;
    }

    if (!imageUrl || !imagePublicId) {
      return "gambar and gambar_public_id must be provided together";
    }

    return null;
  }

  private static parseAbsensiIdParam(
    idParam: string | undefined,
  ): ParsedAbsensiId {
    if (!idParam) {
      return {
        success: false,
        error: "ID is required",
      };
    }

    const id = parseInt(idParam, 10);

    if (isNaN(id)) {
      return {
        success: false,
        error: "Invalid absensi ID",
      };
    }

    return {
      success: true,
      id,
    };
  }

  private static parseUserIdParam(userIdParam: string | undefined): ParsedUserId {
    if (!userIdParam) {
      return {
        success: false,
        error: "User ID is required",
      };
    }

    const userId = parseInt(userIdParam, 10);

    if (isNaN(userId)) {
      return {
        success: false,
        error: "Invalid user ID",
      };
    }

    return {
      success: true,
      userId,
    };
  }

  private static async parseRequestBody(c: Context) {
    return await c.req.json();
  }

  static async getAll(c: Context) {
    try {
      const absensis = await AbsensiService.getAllAbsensis();

      return c.json({
        success: true,
        data: absensis,
        message: "Absensis fetched successfully",
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
        500,
      );
    }
  }

  static async getById(c: Context) {
    try {
      const parsedId = AbsensiController.parseAbsensiIdParam(c.req.param("id"));

      if (parsedId.success === false) {
        return c.json({ success: false, message: parsedId.error }, 400);
      }

      const absensi = await AbsensiService.getAbsensiById(parsedId.id);

      if (!absensi) {
        return c.json({ success: false, message: "Absensi not found" }, 404);
      }

      return c.json({
        success: true,
        data: absensi,
        message: "Absensi fetched successfully",
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
        500,
      );
    }
  }

  static async getByUserId(c: Context) {
    try {
      const parsedUserId = AbsensiController.parseUserIdParam(
        c.req.param("userId"),
      );

      if (parsedUserId.success === false) {
        return c.json({ success: false, message: parsedUserId.error }, 400);
      }

      const absensis = await AbsensiService.getAbsensisByUserId(
        parsedUserId.userId,
      );

      return c.json({
        success: true,
        data: absensis,
        message: "Absensis fetched successfully",
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
        500,
      );
    }
  }

  static async create(c: Context) {
    try {
      const body = (await AbsensiController.parseRequestBody(
        c,
      )) as CreateAbsensiRequestDto;

      if (!body.user_id) {
        return c.json(
          {
            success: false,
            message: "User ID is required",
          },
          400,
        );
      }

      const imageValidationError = AbsensiController.validateImagePayload(
        body.gambar,
        body.gambar_public_id,
      );

      if (imageValidationError) {
        return c.json(
          {
            success: false,
            message: imageValidationError,
          },
          400,
        );
      }

      const result = await AbsensiService.createAbsensi(body);

      return c.json(
        {
          success: true,
          data: result,
          message: "Absensi created successfully",
        },
        201,
      );
    } catch (error) {
      return c.json(
        {
          success: false,
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
        500,
      );
    }
  }

  static async update(c: Context) {
    try {
      const parsedId = AbsensiController.parseAbsensiIdParam(c.req.param("id"));

      if (parsedId.success === false) {
        return c.json({ success: false, message: parsedId.error }, 400);
      }

      const body = (await AbsensiController.parseRequestBody(
        c,
      )) as UpdateAbsensiRequestDto;
      const imageValidationError = AbsensiController.validateImagePayload(
        body.gambar,
        body.gambar_public_id,
      );

      if (imageValidationError) {
        return c.json(
          {
            success: false,
            message: imageValidationError,
          },
          400,
        );
      }

      const updateResult = await AbsensiService.updateAbsensi(parsedId.id, body);

      if (!updateResult) {
        return c.json({ success: false, message: "Absensi not found" }, 404);
      }

      return c.json({
        success: true,
        data: updateResult.result,
        message: "Absensi updated successfully",
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
        500,
      );
    }
  }

  static async delete(c: Context) {
    try {
      const parsedId = AbsensiController.parseAbsensiIdParam(c.req.param("id"));

      if (parsedId.success === false) {
        return c.json({ success: false, message: parsedId.error }, 400);
      }

      const deleteResult = await AbsensiService.deleteAbsensi(parsedId.id);

      if (!deleteResult) {
        return c.json({ success: false, message: "Absensi not found" }, 404);
      }

      return c.json({
        success: true,
        data: deleteResult.result,
        message: "Absensi deleted successfully",
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
        500,
      );
    }
  }
}
