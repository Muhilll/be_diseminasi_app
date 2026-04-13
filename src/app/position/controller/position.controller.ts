import { Context } from "hono";
import {
  CreatePositionRequestDto,
  UpdatePositionRequestDto,
} from "../dto/position-request.dto";
import { PositionService } from "../service/position.service";

type ParsedPositionId =
  | { success: true; id: number }
  | { success: false; error: string };

export class PositionController {
  private static parsePositionIdParam(
    idParam: string | undefined,
  ): ParsedPositionId {
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
        error: "Invalid position ID",
      };
    }

    return {
      success: true,
      id,
    };
  }

  static async getAll(c: Context) {
    try {
      const positions = await PositionService.getAllPositions();

      return c.json({
        success: true,
        data: positions,
        message: "Positions fetched successfully",
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
      const parsedId = PositionController.parsePositionIdParam(c.req.param("id"));

      if (parsedId.success === false) {
        return c.json({ success: false, message: parsedId.error }, 400);
      }

      const position = await PositionService.getPositionById(parsedId.id);

      if (!position) {
        return c.json({ success: false, message: "Position not found" }, 404);
      }

      return c.json({
        success: true,
        data: position,
        message: "Position fetched successfully",
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
      const body: CreatePositionRequestDto = await c.req.json();

      if (!body.category) {
        return c.json(
          {
            success: false,
            message: "Category is required",
          },
          400,
        );
      }

      const result = await PositionService.createPosition(body);

      return c.json(
        {
          success: true,
          data: result,
          message: "Position created successfully",
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
      const parsedId = PositionController.parsePositionIdParam(c.req.param("id"));

      if (parsedId.success === false) {
        return c.json({ success: false, message: parsedId.error }, 400);
      }

      const body: UpdatePositionRequestDto = await c.req.json();
      const updateResult = await PositionService.updatePosition(parsedId.id, body);

      if (!updateResult) {
        return c.json({ success: false, message: "Position not found" }, 404);
      }

      return c.json({
        success: true,
        data: updateResult.result,
        message: "Position updated successfully",
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
      const parsedId = PositionController.parsePositionIdParam(c.req.param("id"));

      if (parsedId.success === false) {
        return c.json({ success: false, message: parsedId.error }, 400);
      }

      const deleteResult = await PositionService.deletePosition(parsedId.id);

      if (!deleteResult) {
        return c.json({ success: false, message: "Position not found" }, 404);
      }

      return c.json({
        success: true,
        data: deleteResult.result,
        message: "Position deleted successfully",
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
