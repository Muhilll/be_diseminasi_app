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
import { gradeSchema } from "../../../docs/openapi-schemas";

const gradeIdParamsSchema = createNumericPathParamsSchema("id");

const createGradeRequestSchema = z
  .object({
    level: createCoercedIntSchema(3),
    grade: z.string().min(1).openapi({
      example: "IIIc",
    }),
    des: z.string().optional().openapi({
      example: "Golongan IIIc",
    }),
  })
  .openapi("CreateGradeRequest");

const updateGradeRequestSchema = z
  .object({
    level: createOptionalCoercedIntSchema(4),
    grade: z.string().min(1).optional().openapi({
      example: "IVa",
    }),
    des: z.string().optional().openapi({
      example: "Golongan IVa",
    }),
  })
  .openapi("UpdateGradeRequest");

const gradeListResponseSchema = createSuccessEnvelopeSchema(
  "GradeListResponse",
  z.array(gradeSchema),
  "Grades fetched successfully",
);

const gradeDetailResponseSchema = createSuccessEnvelopeSchema(
  "GradeDetailResponse",
  gradeSchema,
  "Grade fetched successfully",
);

const gradeMutationResponseSchema = createSuccessEnvelopeSchema(
  "GradeMutationResponse",
  writeResultSchema,
  "Grade created successfully",
);

export const getAllGradesRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Grades"],
  summary: "Get all grades",
  security: protectedSecurity,
  middleware: [
    jwtMiddleware,
    appTokenMiddleware,
    requirePermission(),
  ] as const,
  responses: {
    200: jsonResponse(gradeListResponseSchema, "Grades fetched successfully"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const getGradeByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Grades"],
  summary: "Get grade by id",
  security: protectedSecurity,
  middleware: [
    jwtMiddleware,
    appTokenMiddleware,
    requirePermission(),
  ] as const,
  request: {
    params: gradeIdParamsSchema,
  },
  responses: {
    200: jsonResponse(gradeDetailResponseSchema, "Grade fetched successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Invalid grade id"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    404: jsonResponse(apiErrorResponseSchema, "Grade not found"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const createGradeRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Grades"],
  summary: "Create grade",
  security: protectedSecurity,
  middleware: [
    jwtMiddleware,
    appTokenMiddleware,
    requirePermission(),
  ] as const,
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: createGradeRequestSchema,
        },
      },
    },
  },
  responses: {
    201: jsonResponse(gradeMutationResponseSchema, "Grade created successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Validation error"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const updateGradeRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Grades"],
  summary: "Update grade",
  security: protectedSecurity,
  middleware: [
    jwtMiddleware,
    appTokenMiddleware,
    requirePermission(),
  ] as const,
  request: {
    params: gradeIdParamsSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: updateGradeRequestSchema,
        },
      },
    },
  },
  responses: {
    200: jsonResponse(gradeMutationResponseSchema, "Grade updated successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Validation error"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    404: jsonResponse(apiErrorResponseSchema, "Grade not found"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const deleteGradeRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Grades"],
  summary: "Delete grade",
  security: protectedSecurity,
  middleware: [
    jwtMiddleware,
    appTokenMiddleware,
    requirePermission(),
  ] as const,
  request: {
    params: gradeIdParamsSchema,
  },
  responses: {
    200: jsonResponse(gradeMutationResponseSchema, "Grade deleted successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Invalid grade id"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    404: jsonResponse(apiErrorResponseSchema, "Grade not found"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});
