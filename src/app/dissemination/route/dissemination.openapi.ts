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
import { disseminationSchema } from "../../../docs/openapi-schemas";

const permissionKey = "/disseminations";

const disseminationIdParamsSchema = createNumericPathParamsSchema("id");
const userIdParamsSchema = createNumericPathParamsSchema("userId");

const createDisseminationRequestSchema = z
  .object({
    title: z.string().min(1).openapi({ example: "Sosialisasi Program 2026" }),
    province: z.string().min(1).openapi({ example: "Sulawesi Selatan" }),
    city: z.string().min(1).openapi({ example: "Makassar" }),
    district: z.string().min(1).openapi({ example: "Panakkukang" }),
    village: z.string().min(1).openapi({ example: "Masale" }),
    date: z.string().datetime().openapi({ example: "2026-04-27T10:00:00.000Z" }),
    user_id: createCoercedIntSchema(1),
  })
  .openapi("CreateDisseminationRequest");

const updateDisseminationRequestSchema = z
  .object({
    title: z.string().min(1).optional().openapi({ example: "Sosialisasi Update" }),
    province: z.string().min(1).optional().openapi({ example: "Sulawesi Selatan" }),
    city: z.string().min(1).optional().openapi({ example: "Makassar" }),
    district: z.string().min(1).optional().openapi({ example: "Panakkukang" }),
    village: z.string().min(1).optional().openapi({ example: "Masale" }),
    date: z.string().datetime().optional().openapi({ example: "2026-05-01T09:00:00.000Z" }),
    user_id: createOptionalCoercedIntSchema(2),
  })
  .openapi("UpdateDisseminationRequest");

const listResponseSchema = createSuccessEnvelopeSchema(
  "DisseminationListResponse",
  z.array(disseminationSchema),
  "Disseminations fetched successfully",
);

const detailResponseSchema = createSuccessEnvelopeSchema(
  "DisseminationDetailResponse",
  disseminationSchema,
  "Dissemination fetched successfully",
);

const mutationResponseSchema = createSuccessEnvelopeSchema(
  "DisseminationMutationResponse",
  writeResultSchema,
  "Dissemination created successfully",
);

export const getAllDisseminationsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Disseminations"],
  summary: "Get all disseminations",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission(permissionKey, "can_read")] as const,
  responses: {
    200: jsonResponse(listResponseSchema, "Disseminations fetched successfully"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const getDisseminationByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Disseminations"],
  summary: "Get dissemination by id",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission(permissionKey, "can_read")] as const,
  request: { params: disseminationIdParamsSchema },
  responses: {
    200: jsonResponse(detailResponseSchema, "Dissemination fetched successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Invalid dissemination id"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    404: jsonResponse(apiErrorResponseSchema, "Dissemination not found"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const getDisseminationsByUserIdRoute = createRoute({
  method: "get",
  path: "/user/{userId}",
  tags: ["Disseminations"],
  summary: "Get disseminations by user id",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission(permissionKey, "can_read")] as const,
  request: { params: userIdParamsSchema },
  responses: {
    200: jsonResponse(listResponseSchema, "Disseminations fetched successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Invalid user id"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const createDisseminationRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Disseminations"],
  summary: "Create dissemination",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission(permissionKey, "can_create")] as const,
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: createDisseminationRequestSchema } },
    },
  },
  responses: {
    201: jsonResponse(mutationResponseSchema, "Dissemination created successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Validation error"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const updateDisseminationRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Disseminations"],
  summary: "Update dissemination",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission(permissionKey, "can_update")] as const,
  request: {
    params: disseminationIdParamsSchema,
    body: {
      required: true,
      content: { "application/json": { schema: updateDisseminationRequestSchema } },
    },
  },
  responses: {
    200: jsonResponse(mutationResponseSchema, "Dissemination updated successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Validation error"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    404: jsonResponse(apiErrorResponseSchema, "Dissemination not found"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const deleteDisseminationRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Disseminations"],
  summary: "Delete dissemination",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission(permissionKey, "can_delete")] as const,
  request: { params: disseminationIdParamsSchema },
  responses: {
    200: jsonResponse(mutationResponseSchema, "Dissemination deleted successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Invalid dissemination id"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    404: jsonResponse(apiErrorResponseSchema, "Dissemination not found"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});
