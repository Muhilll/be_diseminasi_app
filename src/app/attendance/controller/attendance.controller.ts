import { Context } from "hono";
import type { TokenPayload } from "../../../utils/jwt";
import {
  AttendanceService,
  AttendanceValidationError,
} from "../service/attendance.service";

export class AttendanceController {
  static async getAll(c: Context) {
    try {
      const user = c.get("user") as TokenPayload;
      const data = await AttendanceService.getAll(user.id, user.role_id);
      return c.json({
        success: true,
        data,
        message: "Attendances fetched successfully",
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Internal server error",
        },
        500,
      );
    }
  }

  static async getToday(c: Context) {
    try {
      const user = c.get("user") as TokenPayload;
      const data = await AttendanceService.getTodayStatus(user.id);
      return c.json({
        success: true,
        data,
        message: "Today attendance status fetched successfully",
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Internal server error",
        },
        500,
      );
    }
  }

  static async checkIn(c: Context) {
    try {
      const user = c.get("user") as TokenPayload;
      const body = await c.req.json();
      const result = await AttendanceService.checkIn(user.id, {
        latitude: body.latitude,
        longitude: body.longitude,
        image: body.image,
        image_public_id: body.image_public_id,
        note: body.note,
      });
      return c.json(
        {
          success: true,
          data: result,
          message: "Check-in recorded successfully",
        },
        201,
      );
    } catch (error) {
      if (error instanceof AttendanceValidationError) {
        return c.json({ success: false, message: error.message }, error.statusCode as 400);
      }
      return c.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Internal server error",
        },
        500,
      );
    }
  }

  static async checkOut(c: Context) {
    try {
      const user = c.get("user") as TokenPayload;
      const body = await c.req.json();
      const result = await AttendanceService.checkOut(user.id, {
        latitude: body.latitude,
        longitude: body.longitude,
        image: body.image,
        image_public_id: body.image_public_id,
        note: body.note,
      });
      return c.json({
        success: true,
        data: result,
        message: "Check-out recorded successfully",
      });
    } catch (error) {
      if (error instanceof AttendanceValidationError) {
        return c.json({ success: false, message: error.message }, error.statusCode as 400);
      }
      return c.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Internal server error",
        },
        500,
      );
    }
  }

  static async delete(c: Context) {
    try {
      const id = Number(c.req.param("id"));
      const result = await AttendanceService.deleteById(id);
      if (!result) {
        return c.json({ success: false, message: "Attendance not found" }, 404);
      }
      return c.json({
        success: true,
        data: result,
        message: "Attendance deleted successfully",
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Internal server error",
        },
        500,
      );
    }
  }
}
