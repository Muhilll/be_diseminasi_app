import { Context } from "hono";
import { DisseminationModel } from "../model/dissemination";

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

  // GET all disseminations
  static async getAll(c: Context) {
    try {
      const disseminations = await DisseminationModel.getAllDisseminations();
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

  // GET dissemination by ID
  static async getById(c: Context) {
    try {
      const idParam = c.req.param("id");

      if (!idParam) {
        return c.json({ success: false, message: "ID is required" }, 400);
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return c.json(
          { success: false, message: "Invalid dissemination ID" },
          400,
        );
      }

      const dissemination = await DisseminationModel.getDisseminationById(id);
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

  // GET disseminations by user ID
  static async getByUserId(c: Context) {
    try {
      const userIdParam = c.req.param("userId");

      if (!userIdParam) {
        return c.json(
          { success: false, message: "User ID is required" },
          400,
        );
      }

      const userId = parseInt(userIdParam, 10);
      if (isNaN(userId)) {
        return c.json(
          { success: false, message: "Invalid user ID" },
          400,
        );
      }

      const disseminations =
        await DisseminationModel.getDisseminationsByUserId(userId);

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

  // POST create new dissemination
  static async create(c: Context) {
    try {
      const body = await c.req.json();
      const parsedDate = DisseminationController.parseDateValue(body.date);

      if (
        !body.title ||
        !body.month ||
        !body.year ||
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
              "Title, month, year, province, city, district, village, date, and user_id are required",
          },
          400,
        );
      }

      const result = await DisseminationModel.createDissemination({
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

  // PUT update dissemination
  static async update(c: Context) {
    try {
      const idParam = c.req.param("id");

      if (!idParam) {
        return c.json({ success: false, message: "ID is required" }, 400);
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return c.json(
          { success: false, message: "Invalid dissemination ID" },
          400,
        );
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

      const dissemination = await DisseminationModel.getDisseminationById(id);
      if (!dissemination) {
        return c.json(
          { success: false, message: "Dissemination not found" },
          404,
        );
      }

      const result = await DisseminationModel.updateDissemination(id, {
        ...body,
        ...(parsedDate !== undefined ? { date: parsedDate } : {}),
      });

      return c.json({
        success: true,
        data: result,
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

  // DELETE dissemination
  static async delete(c: Context) {
    try {
      const idParam = c.req.param("id");

      if (!idParam) {
        return c.json({ success: false, message: "ID is required" }, 400);
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return c.json(
          { success: false, message: "Invalid dissemination ID" },
          400,
        );
      }

      const dissemination = await DisseminationModel.getDisseminationById(id);
      if (!dissemination) {
        return c.json(
          { success: false, message: "Dissemination not found" },
          404,
        );
      }

      const result = await DisseminationModel.deleteDissemination(id);

      return c.json({
        success: true,
        data: result,
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
