import { Context } from "hono";
import { DisseminationDetailService } from "../service/dissemination-detail.service";

type ParsedDisseminationDetailId =
  | { success: true; id: number }
  | { success: false; error: string };

type ParsedDisseminationId =
  | { success: true; disseminationId: number }
  | { success: false; error: string };

export class DisseminationDetailController {
  private static validateImagePayload(
    imageUrl: string | undefined,
    imagePublicId: string | undefined,
  ) {
    if (!imageUrl && !imagePublicId) {
      return null;
    }

    if (!imageUrl || !imagePublicId) {
      return "image and image_public_id must be provided together";
    }

    return null;
  }

  private static parseDateValue(value: unknown) {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? undefined : value;
    }

    const parsedDate = new Date(String(value));
    return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
  }

  private static parseDisseminationDetailIdParam(
    idParam: string | undefined,
  ): ParsedDisseminationDetailId {
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
        error: "Invalid dissemination detail ID",
      };
    }

    return {
      success: true,
      id,
    };
  }

  private static parseDisseminationIdParam(
    disseminationIdParam: string | undefined,
  ): ParsedDisseminationId {
    if (!disseminationIdParam) {
      return {
        success: false,
        error: "Dissemination ID is required",
      };
    }

    const disseminationId = parseInt(disseminationIdParam, 10);

    if (isNaN(disseminationId)) {
      return {
        success: false,
        error: "Invalid dissemination ID",
      };
    }

    return {
      success: true,
      disseminationId,
    };
  }

  private static async parseRequestBody(c: Context) {
    return await c.req.json();
  }

  static async getAll(c: Context) {
    try {
      const details =
        await DisseminationDetailService.getAllDisseminationDetails();

      return c.json({
        success: true,
        data: details,
        message: "Dissemination details fetched successfully",
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
      const parsedId =
        DisseminationDetailController.parseDisseminationDetailIdParam(
          c.req.param("id"),
        );

      if (parsedId.success === false) {
        return c.json({ success: false, message: parsedId.error }, 400);
      }

      const detail = await DisseminationDetailService.getDisseminationDetailById(
        parsedId.id,
      );

      if (!detail) {
        return c.json(
          { success: false, message: "Dissemination detail not found" },
          404,
        );
      }

      return c.json({
        success: true,
        data: detail,
        message: "Dissemination detail fetched successfully",
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

  static async getByDisseminationId(c: Context) {
    try {
      const parsedDisseminationId =
        DisseminationDetailController.parseDisseminationIdParam(
          c.req.param("disseminationId"),
        );

      if (parsedDisseminationId.success === false) {
        return c.json(
          { success: false, message: parsedDisseminationId.error },
          400,
        );
      }

      const details =
        await DisseminationDetailService.getDetailsByDisseminationId(
          parsedDisseminationId.disseminationId,
        );

      return c.json({
        success: true,
        data: details,
        message: "Dissemination details fetched successfully",
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
      const body = await DisseminationDetailController.parseRequestBody(c);
      const parsedDate = DisseminationDetailController.parseDateValue(body.date);

      if (!body.disseminations_id) {
        return c.json(
          {
            success: false,
            message: "Dissemination ID is required",
          },
          400,
        );
      }

      const imageValidationError =
        DisseminationDetailController.validateImagePayload(
          body.image,
          body.image_public_id,
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

      const result =
        await DisseminationDetailService.createDisseminationDetail({
          ...body,
          ...(parsedDate !== undefined ? { date: parsedDate } : {}),
        });

      return c.json(
        {
          success: true,
          data: result,
          message: "Dissemination detail created successfully",
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
      const parsedId =
        DisseminationDetailController.parseDisseminationDetailIdParam(
          c.req.param("id"),
        );

      if (parsedId.success === false) {
        return c.json({ success: false, message: parsedId.error }, 400);
      }

      const body = await DisseminationDetailController.parseRequestBody(c);
      const parsedDate =
        body.date !== undefined
          ? DisseminationDetailController.parseDateValue(body.date)
          : undefined;

      if (body.date !== undefined && parsedDate === undefined) {
        return c.json(
          {
            success: false,
            message: "Invalid date format",
          },
          400,
        );
      }

      const imageValidationError =
        DisseminationDetailController.validateImagePayload(
          body.image,
          body.image_public_id,
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

      const updateResult =
        await DisseminationDetailService.updateDisseminationDetail(parsedId.id, {
          ...body,
          ...(parsedDate !== undefined ? { date: parsedDate } : {}),
        });

      if (!updateResult) {
        return c.json(
          { success: false, message: "Dissemination detail not found" },
          404,
        );
      }

      return c.json({
        success: true,
        data: updateResult.result,
        message: "Dissemination detail updated successfully",
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
      const parsedId =
        DisseminationDetailController.parseDisseminationDetailIdParam(
          c.req.param("id"),
        );

      if (parsedId.success === false) {
        return c.json({ success: false, message: parsedId.error }, 400);
      }

      const deleteResult =
        await DisseminationDetailService.deleteDisseminationDetail(parsedId.id);

      if (!deleteResult) {
        return c.json(
          { success: false, message: "Dissemination detail not found" },
          404,
        );
      }

      return c.json({
        success: true,
        data: deleteResult.result,
        message: "Dissemination detail deleted successfully",
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
