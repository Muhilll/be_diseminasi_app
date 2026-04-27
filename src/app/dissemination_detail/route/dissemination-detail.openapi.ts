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
import { disseminationDetailSchema } from "../../../docs/openapi-schemas";

const permissionKey = "/dissemination-details";

const detailIdParamsSchema = createNumericPathParamsSchema("id");
const disseminationIdParamsSchema = createNumericPathParamsSchema("disseminationId");

const createDetailRequestSchema = z
  .object({
    disseminations_id: createCoercedIntSchema(1),
    basis: z.string().optional().openapi({ example: "Surat Tugas Nomor 001" }),
    material: z.string().optional().openapi({ example: "Materi sosialisasi layanan" }),
    date: z.string().datetime().optional().openapi({ example: "2026-04-27T10:30:00.000Z" }),
    location: z.string().optional().openapi({ example: "Balai Pertemuan Kelurahan" }),
    methode: z.string().optional().openapi({ example: "Offline" }),
    participants: z.string().optional().openapi({ example: "40 peserta" }),
    result: z.string().optional().openapi({ example: "Peserta memahami materi" }),
    image: z.string().optional().openapi({ example: "https://res.cloudinary.com/example/dissemination.jpg" }),
    image_public_id: z.string().optional().openapi({ example: "disseminations/dissemination-1" }),
  })
  .openapi("CreateDisseminationDetailRequest");

const updateDetailRequestSchema = z
  .object({
    disseminations_id: createOptionalCoercedIntSchema(1),
    basis: z.string().optional().openapi({ example: "Surat Tugas Nomor 002" }),
    material: z.string().optional().openapi({ example: "Materi revisi" }),
    date: z.string().datetime().optional().openapi({ example: "2026-05-01T11:30:00.000Z" }),
    location: z.string().optional().openapi({ example: "Aula Kecamatan" }),
    methode: z.string().optional().openapi({ example: "Hybrid" }),
    participants: z.string().optional().openapi({ example: "55 peserta" }),
    result: z.string().optional().openapi({ example: "Dokumentasi diperbarui" }),
    image: z.string().optional().openapi({ example: "https://res.cloudinary.com/example/dissemination-new.jpg" }),
    image_public_id: z.string().optional().openapi({ example: "disseminations/dissemination-1-new" }),
  })
  .openapi("UpdateDisseminationDetailRequest");

const listResponseSchema = createSuccessEnvelopeSchema(
  "DisseminationDetailListResponse",
  z.array(disseminationDetailSchema),
  "Dissemination details fetched successfully",
);

const detailResponseSchema = createSuccessEnvelopeSchema(
  "DisseminationDetailSingleResponse",
  disseminationDetailSchema,
  "Dissemination detail fetched successfully",
);

const mutationResponseSchema = createSuccessEnvelopeSchema(
  "DisseminationDetailMutationResponse",
  writeResultSchema,
  "Dissemination detail created successfully",
);

export const getAllDisseminationDetailsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Dissemination Details"],
  summary: "Get all dissemination details",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission(permissionKey, "can_read")] as const,
  responses: {
    200: jsonResponse(listResponseSchema, "Dissemination details fetched successfully"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const getDisseminationDetailByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Dissemination Details"],
  summary: "Get dissemination detail by id",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission(permissionKey, "can_read")] as const,
  request: { params: detailIdParamsSchema },
  responses: {
    200: jsonResponse(detailResponseSchema, "Dissemination detail fetched successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Invalid dissemination detail id"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    404: jsonResponse(apiErrorResponseSchema, "Dissemination detail not found"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const getDisseminationDetailsByDisseminationIdRoute = createRoute({
  method: "get",
  path: "/dissemination/{disseminationId}",
  tags: ["Dissemination Details"],
  summary: "Get dissemination details by dissemination id",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission(permissionKey, "can_read")] as const,
  request: { params: disseminationIdParamsSchema },
  responses: {
    200: jsonResponse(listResponseSchema, "Dissemination details fetched successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Invalid dissemination id"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const createDisseminationDetailRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Dissemination Details"],
  summary: "Create dissemination detail",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission(permissionKey, "can_create")] as const,
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: createDetailRequestSchema } },
    },
  },
  responses: {
    201: jsonResponse(mutationResponseSchema, "Dissemination detail created successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Validation error"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const updateDisseminationDetailRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Dissemination Details"],
  summary: "Update dissemination detail",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission(permissionKey, "can_update")] as const,
  request: {
    params: detailIdParamsSchema,
    body: {
      required: true,
      content: { "application/json": { schema: updateDetailRequestSchema } },
    },
  },
  responses: {
    200: jsonResponse(mutationResponseSchema, "Dissemination detail updated successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Validation error"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    404: jsonResponse(apiErrorResponseSchema, "Dissemination detail not found"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});

export const deleteDisseminationDetailRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Dissemination Details"],
  summary: "Delete dissemination detail",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission(permissionKey, "can_delete")] as const,
  request: { params: detailIdParamsSchema },
  responses: {
    200: jsonResponse(mutationResponseSchema, "Dissemination detail deleted successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Invalid dissemination detail id"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
    404: jsonResponse(apiErrorResponseSchema, "Dissemination detail not found"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});
