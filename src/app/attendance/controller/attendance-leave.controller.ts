import { Context } from "hono";
import type { TokenPayload } from "../../../utils/jwt";
import { AttendanceLeaveService } from "../service/attendance-leave.service";
import { AttendanceValidationError } from "../service/attendance.service";

export class AttendanceLeaveController {
  static async getAll(c: Context) {
    try {
      const user = c.get("user") as TokenPayload;
      const data = await AttendanceLeaveService.getAll(user.id, user.role_id);
      return c.json({
        success: true,
        data,
        message: "Leave requests fetched successfully",
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

  static async create(c: Context) {
    try {
      const user = c.get("user") as TokenPayload;
      const body = await c.req.json();
      const result = await AttendanceLeaveService.submitLeave(user.id, {
        leave_date: body.leave_date,
        reason: body.reason,
        attachment: body.attachment,
        attachment_public_id: body.attachment_public_id,
      });
      return c.json(
        {
          success: true,
          data: result,
          message: "Leave request submitted successfully",
        },
        201,
      );
    } catch (error) {
      if (error instanceof AttendanceValidationError) {
        return c.json(
          { success: false, message: error.message },
          error.statusCode as 400,
        );
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

  static async review(c: Context) {
    try {
      const user = c.get("user") as TokenPayload;
      const id = Number(c.req.param("id"));
      const body = await c.req.json();
      const result = await AttendanceLeaveService.reviewLeave(id, user.id, {
        action: body.action,
        review_note: body.review_note,
      });
      return c.json({
        success: true,
        data: result,
        message:
          body.action === "approve"
            ? "Leave request approved"
            : "Leave request rejected",
      });
    } catch (error) {
      if (error instanceof AttendanceValidationError) {
        return c.json(
          { success: false, message: error.message },
          error.statusCode as 400 | 404,
        );
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
}
