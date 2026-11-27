import {
  createModuleOpenApiDocument,
  createOpenApiRouter,
  registerDefaultSecuritySchemes,
  registerOpenApiRoute,
} from "../../../docs/openapi-common";
import { AttendanceLeaveController } from "../controller/attendance-leave.controller";
import { AttendanceController } from "../controller/attendance.controller";
import {
  checkInAttendanceRoute,
  checkOutAttendanceRoute,
  createAttendanceLeaveRoute,
  deleteAttendanceRoute,
  getAllAttendanceLeavesRoute,
  getAllAttendancesRoute,
  getTodayAttendanceRoute,
  reviewAttendanceLeaveRoute,
} from "./attendance.openapi";

const router = createOpenApiRouter();
registerDefaultSecuritySchemes(router);

registerOpenApiRoute(router, getAllAttendancesRoute, AttendanceController.getAll);
registerOpenApiRoute(router, getTodayAttendanceRoute, AttendanceController.getToday);
registerOpenApiRoute(router, getAllAttendanceLeavesRoute, AttendanceLeaveController.getAll);
registerOpenApiRoute(router, createAttendanceLeaveRoute, AttendanceLeaveController.create);
registerOpenApiRoute(router, reviewAttendanceLeaveRoute, AttendanceLeaveController.review);
registerOpenApiRoute(router, checkInAttendanceRoute, AttendanceController.checkIn);
registerOpenApiRoute(router, checkOutAttendanceRoute, AttendanceController.checkOut);
registerOpenApiRoute(router, deleteAttendanceRoute, AttendanceController.delete);

export function getAttendanceOpenApiDocument(baseUrl: string) {
  return createModuleOpenApiDocument(router, baseUrl, "Attendance API");
}

export default router;
