import { createRoute, z } from "@hono/zod-openapi";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/permission";
import {
  apiErrorResponseSchema,
  createCoercedIntSchema,
  createNumericPathParamsSchema,
  createOptionalCoercedIntSchema,
  createSuccessEnvelopeSchema,
  jsonResponse,
  protectedSecurity,
  writeResultSchema,
} from "../../../docs/openapi-common";
import { absensiSchema } from "../../../docs/openapi-schemas";

const permissionKey = "/absensis";

const absensiIdParamsSchema = createNumericPathParamsSchema("id");
const userIdParamsSchema = createNumericPathParamsSchema("userId");

const createAbsensiRequestSchema = z
  .object({
    gambar: z.string().optional().openapi({ example: "https://res.cloudinary.com/example/absensi.jpg" }),
    gambar_public_id: z.string().optional().openapi({ example: "absensi/absensi-1" }),
    des: z.string().optional().openapi({ example: "Absensi kunjungan" }),
    user_id: createCoercedIntSchema(1),
  })
  .openapi("CreateAbsensiRequest");

const updateAbsensiRequestSchema = z
  .object({
    gambar: z.string().optional().openapi({ example: "https://res.cloudinary.com/example/absensi-new.jpg" }),
    gambar_public_id: z.string().optional().openapi({ example: "absensi/absensi-1-new" }),
    des: z.string().optional().openapi({ example: "Absensi revisi" }),
    user_id: createOptionalCoercedIntSchema(2),
  })
  .openapi("UpdateAbsensiRequest");

const listResponseSchema = createSuccessEnvelopeSchema(
  "AbsensiListResponse",
  z.array(absensiSchema),
  "Absensis fetched successfully",
);

const detailResponseSchema = createSuccessEnvelopeSchema(
  "AbsensiDetailResponse",
  absensiSchema,
  "Absensi fetched successfully",
);

const mutationResponseSchema = createSuccessEnvelopeSchema(
  "AbsensiMutationResponse",
  writeResultSchema,
  "Absensi created successfully",
);

export const getAllAbsensisRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Absensis"],
  summary: "Get all absensis",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission(permissionKey, "can_read")] as const,
  responses: {
    200: jsonResponse(listResponseSchema, "Absensis fetched successfully"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const getAbsensiByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Absensis"],
  summary: "Get absensi by id",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission(permissionKey, "can_read")] as const,
  request: { params: absensiIdParamsSchema },
  responses: {
    200: jsonResponse(detailResponseSchema, "Absensi fetched successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Invalid absensi id"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    404: jsonResponse(apiErrorResponseSchema, "Absensi not found"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const getAbsensisByUserIdRoute = createRoute({
  method: "get",
  path: "/user/{userId}",
  tags: ["Absensis"],
  summary: "Get absensis by user id",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission(permissionKey, "can_read")] as const,
  request: { params: userIdParamsSchema },
  responses: {
    200: jsonResponse(listResponseSchema, "Absensis fetched successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Invalid user id"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const createAbsensiRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Absensis"],
  summary: "Create absensi",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission(permissionKey, "can_create")] as const,
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: createAbsensiRequestSchema } },
    },
  },
  responses: {
    201: jsonResponse(mutationResponseSchema, "Absensi created successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Validation error"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const updateAbsensiRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Absensis"],
  summary: "Update absensi",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission(permissionKey, "can_update")] as const,
  request: {
    params: absensiIdParamsSchema,
    body: {
      required: true,
      content: { "application/json": { schema: updateAbsensiRequestSchema } },
    },
  },
  responses: {
    200: jsonResponse(mutationResponseSchema, "Absensi updated successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Validation error"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    404: jsonResponse(apiErrorResponseSchema, "Absensi not found"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const deleteAbsensiRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Absensis"],
  summary: "Delete absensi",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission(permissionKey, "can_delete")] as const,
  request: { params: absensiIdParamsSchema },
  responses: {
    200: jsonResponse(mutationResponseSchema, "Absensi deleted successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Invalid absensi id"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    404: jsonResponse(apiErrorResponseSchema, "Absensi not found"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});
