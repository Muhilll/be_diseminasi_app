import { Context } from "hono";
import {
  CreateGradeRequestDto,
  UpdateGradeRequestDto,
} from "../dto/grade-request.dto";
import { GradeService } from "../service/grade.service";

type ParsedGradeId =
  | { success: true; id: number }
  | { success: false; error: string };

export class GradeController {
  private static parseGradeIdParam(idParam: string | undefined): ParsedGradeId {
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
        error: "Invalid grade ID",
      };
    }

    return {
      success: true,
      id,
    };
  }

  static async getAll(c: Context) {
    try {
      const grades = await GradeService.getAllGrades();

      return c.json({
        success: true,
        data: grades,
        message: "Grades fetched successfully",
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
      const parsedId = GradeController.parseGradeIdParam(c.req.param("id"));

      if (!parsedId.success) {
        return c.json({ success: false, message: parsedId.error }, 400);
      }

      const grade = await GradeService.getGradeById(parsedId.id);

      if (!grade) {
        return c.json({ success: false, message: "Grade not found" }, 404);
      }

      return c.json({
        success: true,
        data: grade,
        message: "Grade fetched successfully",
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
      const body: CreateGradeRequestDto = await c.req.json();

      if (!body.level || !body.grade) {
        return c.json(
          {
            success: false,
            message: "Level and grade are required",
          },
          400,
        );
      }

      const result = await GradeService.createGrade(body);

      return c.json(
        {
          success: true,
          data: result,
          message: "Grade created successfully",
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
      const parsedId = GradeController.parseGradeIdParam(c.req.param("id"));

      if (!parsedId.success) {
        return c.json({ success: false, message: parsedId.error }, 400);
      }

      const body: UpdateGradeRequestDto = await c.req.json();
      const updateResult = await GradeService.updateGrade(parsedId.id, body);

      if (!updateResult) {
        return c.json({ success: false, message: "Grade not found" }, 404);
      }

      return c.json({
        success: true,
        data: updateResult.result,
        message: "Grade updated successfully",
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
      const parsedId = GradeController.parseGradeIdParam(c.req.param("id"));

      if (!parsedId.success) {
        return c.json({ success: false, message: parsedId.error }, 400);
      }

      const deleteResult = await GradeService.deleteGrade(parsedId.id);

      if (!deleteResult) {
        return c.json({ success: false, message: "Grade not found" }, 404);
      }

      return c.json({
        success: true,
        data: deleteResult.result,
        message: "Grade deleted successfully",
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
