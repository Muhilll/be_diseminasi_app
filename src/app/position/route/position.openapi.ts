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
import { positionSchema } from "../../../docs/openapi-schemas";

const positionPermissionKey = "/master-data/positions";

const positionIdParamsSchema = createNumericPathParamsSchema("id");

const createPositionRequestSchema = z
  .object({
    category: z.string().min(1).openapi({
      example: "expertise",
    }),
    des: z.string().optional().openapi({
      example: "Ahli Komunikasi",
    }),
  })
  .openapi("CreatePositionRequest");

const updatePositionRequestSchema = z
  .object({
    category: z.string().min(1).optional().openapi({
      example: "skills",
    }),
    des: z.string().optional().openapi({
      example: "Keterampilan Administrasi",
    }),
  })
  .openapi("UpdatePositionRequest");

const positionListResponseSchema = createSuccessEnvelopeSchema(
  "PositionListResponse",
  z.array(positionSchema),
  "Positions fetched successfully",
);

const positionDetailResponseSchema = createSuccessEnvelopeSchema(
  "PositionDetailResponse",
  positionSchema,
  "Position fetched successfully",
);

const positionMutationResponseSchema = createSuccessEnvelopeSchema(
  "PositionMutationResponse",
  writeResultSchema,
  "Position created successfully",
);

export const getAllPositionsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Positions"],
  summary: "Get all positions",
  security: protectedSecurity,
  middleware: [
    jwtMiddleware,
    appTokenMiddleware,
    requirePermission(positionPermissionKey, "can_read"),
  ] as const,
  responses: {
    200: jsonResponse(
      positionListResponseSchema,
      "Positions fetched successfully",
    ),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const getPositionByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Positions"],
  summary: "Get position by id",
  security: protectedSecurity,
  middleware: [
    jwtMiddleware,
    appTokenMiddleware,
    requirePermission(positionPermissionKey, "can_read"),
  ] as const,
  request: {
    params: positionIdParamsSchema,
  },
  responses: {
    200: jsonResponse(positionDetailResponseSchema, "Position fetched successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Invalid position id"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    404: jsonResponse(apiErrorResponseSchema, "Position not found"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const createPositionRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Positions"],
  summary: "Create position",
  security: protectedSecurity,
  middleware: [
    jwtMiddleware,
    appTokenMiddleware,
    requirePermission(positionPermissionKey, "can_create"),
  ] as const,
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: createPositionRequestSchema,
        },
      },
    },
  },
  responses: {
    201: jsonResponse(
      positionMutationResponseSchema,
      "Position created successfully",
    ),
    400: jsonResponse(apiErrorResponseSchema, "Validation error"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const updatePositionRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Positions"],
  summary: "Update position",
  security: protectedSecurity,
  middleware: [
    jwtMiddleware,
    appTokenMiddleware,
    requirePermission(positionPermissionKey, "can_update"),
  ] as const,
  request: {
    params: positionIdParamsSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: updatePositionRequestSchema,
        },
      },
    },
  },
  responses: {
    200: jsonResponse(
      positionMutationResponseSchema,
      "Position updated successfully",
    ),
    400: jsonResponse(apiErrorResponseSchema, "Validation error"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    404: jsonResponse(apiErrorResponseSchema, "Position not found"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const deletePositionRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Positions"],
  summary: "Delete position",
  security: protectedSecurity,
  middleware: [
    jwtMiddleware,
    appTokenMiddleware,
    requirePermission(positionPermissionKey, "can_delete"),
  ] as const,
  request: {
    params: positionIdParamsSchema,
  },
  responses: {
    200: jsonResponse(
      positionMutationResponseSchema,
      "Position deleted successfully",
    ),
    400: jsonResponse(apiErrorResponseSchema, "Invalid position id"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    404: jsonResponse(apiErrorResponseSchema, "Position not found"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});
