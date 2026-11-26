import { Context } from "hono";
import { AttendanceScheduleRepository } from "../repository/attendance-schedule.repository";

export class AttendanceScheduleController {
  static async getAll(c: Context) {
    try {
      const data = await AttendanceScheduleRepository.getAllWithUsers();
      return c.json({
        success: true,
        data,
        message: "Attendance schedules fetched successfully",
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

  static async getByUserId(c: Context) {
    try {
      const userId = Number(c.req.param("userId"));
      const data = await AttendanceScheduleRepository.getByUserId(userId);
      if (!data) {
        return c.json({ success: false, message: "User not found" }, 404);
      }
      return c.json({
        success: true,
        data,
        message: "Attendance schedule fetched successfully",
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

  static async upsertByUserId(c: Context) {
    try {
      const userId = Number(c.req.param("userId"));
      const body = await c.req.json();
      const updated = await AttendanceScheduleRepository.upsertUserSchedule(
        userId,
        body.schedules,
      );
      if (!updated) {
        return c.json({ success: false, message: "User not found" }, 404);
      }
      return c.json({
        success: true,
        data: updated,
        message: "Attendance schedule updated successfully",
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
