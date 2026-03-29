import { Context } from "hono";
import { DisseminationService } from "../service/dissemination.service";

type ParsedDisseminationId =
  | { success: true; id: number }
  | { success: false; error: string };

type ParsedUserId =
  | { success: true; userId: number }
  | { success: false; error: string };

export class DisseminationController {
  private static parseDateValue(value: unknown) {
    if (value === undefined || value === null || value === "") {
      return null;
    }

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    const parsedDate = new Date(String(value));
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  private static parseDisseminationIdParam(
    idParam: string | undefined,
  ): ParsedDisseminationId {
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
        error: "Invalid dissemination ID",
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

  static async getAll(c: Context) {
    try {
      const disseminations = await DisseminationService.getAllDisseminations();

      return c.json({
        success: true,
        data: disseminations,
        message: "Disseminations fetched successfully",
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
      const parsedId = DisseminationController.parseDisseminationIdParam(
        c.req.param("id"),
      );

      if (!parsedId.success) {
        return c.json({ success: false, message: parsedId.error }, 400);
      }

      const dissemination = await DisseminationService.getDisseminationById(
        parsedId.id,
      );

      if (!dissemination) {
        return c.json(
          { success: false, message: "Dissemination not found" },
          404,
        );
      }

      return c.json({
        success: true,
        data: dissemination,
        message: "Dissemination fetched successfully",
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
      const parsedUserId = DisseminationController.parseUserIdParam(
        c.req.param("userId"),
      );

      if (!parsedUserId.success) {
        return c.json({ success: false, message: parsedUserId.error }, 400);
      }

      const disseminations = await DisseminationService.getDisseminationsByUserId(
        parsedUserId.userId,
      );

      return c.json({
        success: true,
        data: disseminations,
        message: "Disseminations fetched successfully",
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
      const body = await c.req.json();
      const parsedDate = DisseminationController.parseDateValue(body.date);

      if (
        !body.title ||
        !body.province ||
        !body.city ||
        !body.district ||
        !body.village ||
        !parsedDate ||
        !body.user_id
      ) {
        return c.json(
          {
            success: false,
            message:
              "Title, province, city, district, village, date, and user_id are required",
          },
          400,
        );
      }

      const result = await DisseminationService.createDissemination({
        ...body,
        date: parsedDate,
      });

      return c.json(
        {
          success: true,
          data: result,
          message: "Dissemination created successfully",
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
      const parsedId = DisseminationController.parseDisseminationIdParam(
        c.req.param("id"),
      );

      if (!parsedId.success) {
        return c.json({ success: false, message: parsedId.error }, 400);
      }

      const body = await c.req.json();
      const parsedDate =
        body.date !== undefined
          ? DisseminationController.parseDateValue(body.date)
          : undefined;

      if (body.date !== undefined && !parsedDate) {
        return c.json(
          {
            success: false,
            message: "Invalid date format",
          },
          400,
        );
      }

      const updateResult = await DisseminationService.updateDissemination(
        parsedId.id,
        {
          ...body,
          ...(parsedDate !== undefined ? { date: parsedDate } : {}),
        },
      );

      if (!updateResult) {
        return c.json(
          { success: false, message: "Dissemination not found" },
          404,
        );
      }

      return c.json({
        success: true,
        data: updateResult.result,
        message: "Dissemination updated successfully",
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
      const parsedId = DisseminationController.parseDisseminationIdParam(
        c.req.param("id"),
      );

      if (!parsedId.success) {
        return c.json({ success: false, message: parsedId.error }, 400);
      }

      const deleteResult = await DisseminationService.deleteDissemination(
        parsedId.id,
      );

      if (!deleteResult) {
        return c.json(
          { success: false, message: "Dissemination not found" },
          404,
        );
      }

      return c.json({
        success: true,
        data: deleteResult.result,
        message: "Dissemination deleted successfully",
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
