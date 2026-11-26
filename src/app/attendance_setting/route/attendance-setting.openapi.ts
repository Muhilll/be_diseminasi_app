import { createRoute, z } from "@hono/zod-openapi";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/permission";
import {
  apiErrorResponseSchema,
  createSuccessEnvelopeSchema,
  jsonResponse,
  protectedSecurity,
  timestampSchema,
} from "../../../docs/openapi-common";

const hhmmRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const attendanceSettingSchema = z
  .object({
    id: z.number().int(),
    location_name: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    radius_meters: z.number().int(),
    check_in_deadline: z.string(),
    check_out_deadline: z.string(),
    created_at: timestampSchema.optional(),
    updated_at: timestampSchema.optional(),
  })
  .openapi("AttendanceSetting");

const updateSettingSchema = z
  .object({
    location_name: z.string().min(1).max(150),
    latitude: z.number().finite().min(-90).max(90),
    longitude: z.number().finite().min(-180).max(180),
    radius_meters: z.number().int().min(10).max(50000),
    check_in_deadline: z.string().regex(hhmmRegex, "Format must be HH:mm"),
    check_out_deadline: z.string().regex(hhmmRegex, "Format must be HH:mm"),
  })
  .openapi("UpdateAttendanceSettingRequest");

const settingResponseSchema = createSuccessEnvelopeSchema(
  "AttendanceSettingResponse",
  attendanceSettingSchema,
  "Attendance setting fetched successfully",
);

export const getAttendanceSettingRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Attendance Settings"],
  summary: "Get global attendance setting",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission()] as const,
  responses: {
    200: jsonResponse(settingResponseSchema, "Attendance setting fetched successfully"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const updateAttendanceSettingRoute = createRoute({
  method: "put",
  path: "/",
  tags: ["Attendance Settings"],
  summary: "Update global attendance setting",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission()] as const,
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: updateSettingSchema } },
    },
  },
  responses: {
    200: jsonResponse(settingResponseSchema, "Attendance setting updated successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Validation error"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});
