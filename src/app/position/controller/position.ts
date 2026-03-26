import { Context } from "hono";
import { PositionModel } from "../model/position";

export class PositionController {
  // GET all positions
  static async getAll(c: Context) {
    try {
      const positions = await PositionModel.getAllPositions();
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

  // GET position by ID
  static async getById(c: Context) {
    try {
      const idParam = c.req.param("id");

      if (!idParam) {
        return c.json({ success: false, message: "ID is required" }, 400);
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return c.json({ success: false, message: "Invalid position ID" }, 400);
      }

      const position = await PositionModel.getPositionById(id);
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

  // POST create new position
  static async create(c: Context) {
    try {
      const body = await c.req.json();

      if (!body.category) {
        return c.json(
          {
            success: false,
            message: "Category is required",
          },
          400,
        );
      }

      const result = await PositionModel.createPosition(body);

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

  // PUT update position
  static async update(c: Context) {
    try {
      const idParam = c.req.param("id");

      if (!idParam) {
        return c.json({ success: false, message: "ID is required" }, 400);
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return c.json({ success: false, message: "Invalid position ID" }, 400);
      }

      const body = await c.req.json();

      const position = await PositionModel.getPositionById(id);
      if (!position) {
        return c.json({ success: false, message: "Position not found" }, 404);
      }

      const result = await PositionModel.updatePosition(id, body);

      return c.json({
        success: true,
        data: result,
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

  // DELETE position
  static async delete(c: Context) {
    try {
      const idParam = c.req.param("id");

      if (!idParam) {
        return c.json({ success: false, message: "ID is required" }, 400);
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return c.json({ success: false, message: "Invalid position ID" }, 400);
      }

      const position = await PositionModel.getPositionById(id);
      if (!position) {
        return c.json({ success: false, message: "Position not found" }, 404);
      }

      const result = await PositionModel.deletePosition(id);

      return c.json({
        success: true,
        data: result,
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
