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
} from "../../../docs/openapi-common";

const userIdParamsSchema = createNumericPathParamsSchema("userId");

const scheduleDaySchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  is_active: z.boolean(),
});

const userScheduleSchema = z
  .object({
    user_id: z.number().int(),
    user_name: z.string(),
    user_email: z.string(),
    role_code: z.string(),
    schedules: z.array(scheduleDaySchema),
  })
  .openapi("UserAttendanceSchedule");

const upsertUserScheduleRequestSchema = z
  .object({
    schedules: z.array(scheduleDaySchema).min(1).max(7),
  })
  .openapi("UpsertUserAttendanceScheduleRequest");

const listResponseSchema = createSuccessEnvelopeSchema(
  "AttendanceScheduleListResponse",
  z.array(userScheduleSchema),
  "Attendance schedules fetched successfully",
);

const detailResponseSchema = createSuccessEnvelopeSchema(
  "AttendanceScheduleDetailResponse",
  userScheduleSchema,
  "Attendance schedule fetched successfully",
);

export const getAllAttendanceSchedulesRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Attendance Schedules"],
  summary: "Get all users weekly attendance schedules",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission()] as const,
  responses: {
    200: jsonResponse(listResponseSchema, "Attendance schedules fetched successfully"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const getAttendanceScheduleByUserIdRoute = createRoute({
  method: "get",
  path: "/user/{userId}",
  tags: ["Attendance Schedules"],
  summary: "Get weekly attendance schedule for a user",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission()] as const,
  request: { params: userIdParamsSchema },
  responses: {
    200: jsonResponse(detailResponseSchema, "Attendance schedule fetched successfully"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    404: jsonResponse(apiErrorResponseSchema, "User not found"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const upsertAttendanceScheduleByUserIdRoute = createRoute({
  method: "put",
  path: "/user/{userId}",
  tags: ["Attendance Schedules"],
  summary: "Update weekly attendance schedule for a user",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission()] as const,
  request: {
    params: userIdParamsSchema,
    body: {
      required: true,
      content: { "application/json": { schema: upsertUserScheduleRequestSchema } },
    },
  },
  responses: {
    200: jsonResponse(detailResponseSchema, "Attendance schedule updated successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Validation error"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    404: jsonResponse(apiErrorResponseSchema, "User not found"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});
