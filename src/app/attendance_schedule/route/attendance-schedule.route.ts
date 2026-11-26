import {
  createModuleOpenApiDocument,
  createOpenApiRouter,
  registerDefaultSecuritySchemes,
  registerOpenApiRoute,
} from "../../../docs/openapi-common";
import { AttendanceScheduleController } from "../controller/attendance-schedule.controller";
import {
  getAllAttendanceSchedulesRoute,
  getAttendanceScheduleByUserIdRoute,
  upsertAttendanceScheduleByUserIdRoute,
} from "./attendance-schedule.openapi";

const router = createOpenApiRouter();
registerDefaultSecuritySchemes(router);

registerOpenApiRoute(
  router,
  getAllAttendanceSchedulesRoute,
  AttendanceScheduleController.getAll,
);
registerOpenApiRoute(
  router,
  getAttendanceScheduleByUserIdRoute,
  AttendanceScheduleController.getByUserId,
);
registerOpenApiRoute(
  router,
  upsertAttendanceScheduleByUserIdRoute,
  AttendanceScheduleController.upsertByUserId,
);

export function getAttendanceScheduleOpenApiDocument(baseUrl: string) {
  return createModuleOpenApiDocument(router, baseUrl, "Attendance Schedule API");
}

export default router;
