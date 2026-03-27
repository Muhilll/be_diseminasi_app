import { Context } from "hono";
import { DisseminationDetailModel } from "../model/dissemination_detail";

export class DisseminationDetailController {
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

  // GET all dissemination details
  static async getAll(c: Context) {
    try {
      const details = await DisseminationDetailModel.getAllDisseminationDetails();
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

  // GET dissemination detail by ID
  static async getById(c: Context) {
    try {
      const idParam = c.req.param("id");

      if (!idParam) {
        return c.json({ success: false, message: "ID is required" }, 400);
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return c.json(
          { success: false, message: "Invalid dissemination detail ID" },
          400,
        );
      }

      const detail =
        await DisseminationDetailModel.getDisseminationDetailById(id);
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

  // GET details by dissemination ID
  static async getByDisseminationId(c: Context) {
    try {
      const disseminationIdParam = c.req.param("disseminationId");

      if (!disseminationIdParam) {
        return c.json(
          { success: false, message: "Dissemination ID is required" },
          400,
        );
      }

      const disseminationId = parseInt(disseminationIdParam, 10);
      if (isNaN(disseminationId)) {
        return c.json(
          { success: false, message: "Invalid dissemination ID" },
          400,
        );
      }

      const details =
        await DisseminationDetailModel.getDetailsByDisseminationId(
          disseminationId
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

  // POST create new dissemination detail
  static async create(c: Context) {
    try {
      const body = await c.req.json();
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

      const result =
        await DisseminationDetailModel.createDisseminationDetail({
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

  // PUT update dissemination detail
  static async update(c: Context) {
    try {
      const idParam = c.req.param("id");

      if (!idParam) {
        return c.json({ success: false, message: "ID is required" }, 400);
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return c.json(
          { success: false, message: "Invalid dissemination detail ID" },
          400,
        );
      }

      const body = await c.req.json();
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

      const detail =
        await DisseminationDetailModel.getDisseminationDetailById(id);
      if (!detail) {
        return c.json(
          { success: false, message: "Dissemination detail not found" },
          404,
        );
      }

      const result = await DisseminationDetailModel.updateDisseminationDetail(
        id,
        {
          ...body,
          ...(parsedDate !== undefined ? { date: parsedDate } : {}),
        }
      );

      return c.json({
        success: true,
        data: result,
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

  // DELETE dissemination detail
  static async delete(c: Context) {
    try {
      const idParam = c.req.param("id");

      if (!idParam) {
        return c.json({ success: false, message: "ID is required" }, 400);
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return c.json(
          { success: false, message: "Invalid dissemination detail ID" },
          400,
        );
      }

      const detail =
        await DisseminationDetailModel.getDisseminationDetailById(id);
      if (!detail) {
        return c.json(
          { success: false, message: "Dissemination detail not found" },
          404,
        );
      }

      const result = await DisseminationDetailModel.deleteDisseminationDetail(
        id
      );

      return c.json({
        success: true,
        data: result,
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
