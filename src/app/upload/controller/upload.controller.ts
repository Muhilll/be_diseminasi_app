import { Context } from "hono";
import { createSignedUploadParams } from "../../../utils/cloudinary";

type UploadTarget = "absensi" | "dissemination_details";

function isUploadTarget(value: unknown): value is UploadTarget {
  return value === "absensi" || value === "dissemination_details";
}

export class UploadController {
  static async createSignature(c: Context) {
    try {
      const body = await c.req.json().catch(() => ({}));
      const target = body?.target;

      if (!isUploadTarget(target)) {
        return c.json(
          {
            success: false,
            message:
              'Invalid upload target. Allowed targets: "absensi", "dissemination_details".',
          },
          400,
        );
      }

      const signedParams = createSignedUploadParams(target);

      return c.json({
        success: true,
        data: {
          target,
          ...signedParams,
        },
        message: "Upload signature created successfully",
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
        500,
      );
    }
  }
}
