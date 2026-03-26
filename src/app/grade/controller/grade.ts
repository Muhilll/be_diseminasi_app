import { Context } from "hono";
import { GradeModel } from "../model/grade";

export class GradeController {
  // GET all grades
  static async getAll(c: Context) {
    try {
      const grades = await GradeModel.getAllGrades();
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

  // GET grade by ID
  static async getById(c: Context) {
    try {
      const idParam = c.req.param("id");

      if (!idParam) {
        return c.json({ success: false, message: "ID is required" }, 400);
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return c.json({ success: false, message: "Invalid grade ID" }, 400);
      }

      const grade = await GradeModel.getGradeById(id);
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

  // POST create new grade
  static async create(c: Context) {
    try {
      const body = await c.req.json();

      if (!body.level || !body.grade) {
        return c.json(
          {
            success: false,
            message: "Level and grade are required",
          },
          400,
        );
      }

      const result = await GradeModel.createGrade(body);

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

  // PUT update grade
  static async update(c: Context) {
    try {
      const idParam = c.req.param("id");

      if (!idParam) {
        return c.json({ success: false, message: "ID is required" }, 400);
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return c.json({ success: false, message: "Invalid grade ID" }, 400);
      }

      const body = await c.req.json();

      const grade = await GradeModel.getGradeById(id);
      if (!grade) {
        return c.json({ success: false, message: "Grade not found" }, 404);
      }

      const result = await GradeModel.updateGrade(id, body);

      return c.json({
        success: true,
        data: result,
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

  // DELETE grade
  static async delete(c: Context) {
    try {
      const idParam = c.req.param("id");

      if (!idParam) {
        return c.json({ success: false, message: "ID is required" }, 400);
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return c.json({ success: false, message: "Invalid grade ID" }, 400);
      }

      const grade = await GradeModel.getGradeById(id);
      if (!grade) {
        return c.json({ success: false, message: "Grade not found" }, 404);
      }

      const result = await GradeModel.deleteGrade(id);

      return c.json({
        success: true,
        data: result,
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
