import {
  createModuleOpenApiDocument,
  createOpenApiRouter,
  registerDefaultSecuritySchemes,
  registerOpenApiRoute,
} from "../../../docs/openapi-common";
import { AttendanceSettingController } from "../controller/attendance-setting.controller";
import {
  getAttendanceSettingRoute,
  updateAttendanceSettingRoute,
} from "./attendance-setting.openapi";

const router = createOpenApiRouter();
registerDefaultSecuritySchemes(router);

registerOpenApiRoute(router, getAttendanceSettingRoute, AttendanceSettingController.get);
registerOpenApiRoute(router, updateAttendanceSettingRoute, AttendanceSettingController.update);

export function getAttendanceSettingOpenApiDocument(baseUrl: string) {
  return createModuleOpenApiDocument(router, baseUrl, "Attendance Setting API");
}

export default router;
