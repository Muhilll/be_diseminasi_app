import { createRoute, z } from "@hono/zod-openapi";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/permission";
import {
  apiErrorResponseSchema,
  createNumericPathParamsSchema,
  createSuccessEnvelopeSchema,
  jsonResponse,
  protectedSecurity,
  writeResultSchema,
} from "../../../docs/openapi-common";

const attendanceIdParamsSchema = createNumericPathParamsSchema("id");
const leaveIdParamsSchema = createNumericPathParamsSchema("id");

const createLeaveRequestSchema = z
  .object({
    leave_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
    reason: z.string().min(1),
    attachment: z.string().min(1).optional(),
    attachment_public_id: z.string().min(1).optional(),
  })
  .openapi("AttendanceLeaveCreateRequest");

const reviewLeaveRequestSchema = z
  .object({
    action: z.enum(["approve", "reject"]),
    review_note: z.string().optional(),
  })
  .openapi("AttendanceLeaveReviewRequest");

const checkInOutRequestSchema = z
  .object({
    latitude: z.number().finite().min(-90).max(90),
    longitude: z.number().finite().min(-180).max(180),
    image: z.string().min(1),
    image_public_id: z.string().min(1),
    note: z.string().optional(),
  })
  .openapi("AttendanceCheckInOutRequest");

const attendanceSchema = z.any().openapi("AttendanceRecord");

const listResponseSchema = createSuccessEnvelopeSchema(
  "AttendanceListResponse",
  z.array(attendanceSchema),
  "Attendances fetched successfully",
);

const todayResponseSchema = createSuccessEnvelopeSchema(
  "AttendanceTodayResponse",
  z.any(),
  "Today attendance status fetched successfully",
);

const mutationResponseSchema = createSuccessEnvelopeSchema(
  "AttendanceMutationResponse",
  writeResultSchema,
  "Attendance saved successfully",
);

export const getAllAttendancesRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Attendances"],
  summary: "Get attendances (Admin: all, User: own)",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission()] as const,
  responses: {
    200: jsonResponse(listResponseSchema, "Attendances fetched successfully"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const getTodayAttendanceRoute = createRoute({
  method: "get",
  path: "/today",
  tags: ["Attendances"],
  summary: "Get logged-in user today attendance status, schedule, and settings",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission()] as const,
  responses: {
    200: jsonResponse(todayResponseSchema, "Today attendance status fetched successfully"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const checkInAttendanceRoute = createRoute({
  method: "post",
  path: "/check-in",
  tags: ["Attendances"],
  summary: "Record attendance check-in",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission()] as const,
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: checkInOutRequestSchema } },
    },
  },
  responses: {
    201: jsonResponse(mutationResponseSchema, "Check-in recorded successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Validation or radius/schedule error"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const checkOutAttendanceRoute = createRoute({
  method: "post",
  path: "/check-out",
  tags: ["Attendances"],
  summary: "Record attendance check-out",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission("can_update")] as const,
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: checkInOutRequestSchema } },
    },
  },
  responses: {
    200: jsonResponse(mutationResponseSchema, "Check-out recorded successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Validation or radius/open-checkin error"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const deleteAttendanceRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Attendances"],
  summary: "Delete attendance record",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission()] as const,
  request: { params: attendanceIdParamsSchema },
  responses: {
    200: jsonResponse(mutationResponseSchema, "Attendance deleted successfully"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    404: jsonResponse(apiErrorResponseSchema, "Attendance not found"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const getAllAttendanceLeavesRoute = createRoute({
  method: "get",
  path: "/leaves",
  tags: ["Attendances"],
  summary: "Get attendance leave requests (can_report: all, else own)",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission("can_read")] as const,
  responses: {
    200: jsonResponse(listResponseSchema, "Leave requests fetched successfully"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const createAttendanceLeaveRoute = createRoute({
  method: "post",
  path: "/leaves",
  tags: ["Attendances"],
  summary: "Submit attendance leave request (Izin)",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission("can_create")] as const,
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: createLeaveRequestSchema } },
    },
  },
  responses: {
    201: jsonResponse(mutationResponseSchema, "Leave request submitted successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Validation or schedule error"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const reviewAttendanceLeaveRoute = createRoute({
  method: "patch",
  path: "/leaves/{id}/review",
  tags: ["Attendances"],
  summary: "Approve or reject a pending leave request",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission("can_report")] as const,
  request: {
    params: leaveIdParamsSchema,
    body: {
      required: true,
      content: { "application/json": { schema: reviewLeaveRequestSchema } },
    },
  },
  responses: {
    200: jsonResponse(mutationResponseSchema, "Leave request reviewed successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Validation error"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    404: jsonResponse(apiErrorResponseSchema, "Leave request not found"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});
