import { Context } from "hono";
import { AttendanceSettingRepository } from "../repository/attendance-setting.repository";

const DEFAULT_SETTING = {
  id: 0,
  location_name: "Basecamp",
  latitude: -5.147665,
  longitude: 119.432732,
  radius_meters: 100,
  check_in_deadline: "21:00",
  check_out_deadline: "17:00",
};

export class AttendanceSettingController {
  static async get(c: Context) {
    try {
      const setting = await AttendanceSettingRepository.getSetting();
      return c.json({
        success: true,
        data: setting ?? DEFAULT_SETTING,
        message: "Attendance setting fetched successfully",
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

  static async update(c: Context) {
    try {
      const body = await c.req.json();
      const updated = await AttendanceSettingRepository.upsertSetting(body);
      return c.json({
        success: true,
        data: updated,
        message: "Attendance setting updated successfully",
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
