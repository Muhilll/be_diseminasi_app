import { createRoute, z } from "@hono/zod-openapi";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import {
  apiErrorResponseSchema,
  createSuccessEnvelopeSchema,
  jsonResponse,
  protectedSecurity,
} from "../../../docs/openapi-common";
import { uploadSignatureResponseSchema } from "../../../docs/openapi-schemas";

const uploadSignatureRequestSchema = z
  .object({
    target: z.enum(["absensi", "dissemination_details"]).openapi({
      example: "absensi",
    }),
  })
  .openapi("UploadSignatureRequest");

const uploadSignatureEnvelopeSchema = createSuccessEnvelopeSchema(
  "UploadSignatureEnvelopeResponse",
  uploadSignatureResponseSchema,
  "Upload signature created successfully",
);

export const createUploadSignatureRoute = createRoute({
  method: "post",
  path: "/signature",
  tags: ["Uploads"],
  summary: "Create Cloudinary signed upload params",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware] as const,
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: uploadSignatureRequestSchema } },
    },
  },
  responses: {
    200: jsonResponse(
      uploadSignatureEnvelopeSchema,
      "Upload signature created successfully",
    ),
    400: jsonResponse(apiErrorResponseSchema, "Validation error"),
    401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
    500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
  },
});
