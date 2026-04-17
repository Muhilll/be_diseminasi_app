import { v2 as cloudinary } from "cloudinary";

type CloudinaryTarget = "dissemination_details" | "absensi";
type CloudinaryFolder = "disseminations" | "absensi";

function getCloudinaryUrl(target: CloudinaryTarget) {
  if (target === "dissemination_details") {
    return process.env.CLOUDINARY_URL_DISSEMINATION_DETAILS;
  }

  return process.env.CLOUDINARY_URL_ABSENSI;
}

function parseCloudinaryUrl(cloudinaryUrl: string) {
  const parsedUrl = new URL(cloudinaryUrl);
  const cloudName = parsedUrl.hostname;
  const apiKey = decodeURIComponent(parsedUrl.username);
  const apiSecret = decodeURIComponent(parsedUrl.password);

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Invalid Cloudinary URL configuration");
  }

  return {
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  };
}

function configureCloudinary(target: CloudinaryTarget) {
  const cloudinaryUrl = getCloudinaryUrl(target);

  if (!cloudinaryUrl) {
    throw new Error(`Cloudinary URL for ${target} is not configured`);
  }

  cloudinary.config(parseCloudinaryUrl(cloudinaryUrl));
}

function getCloudinaryFolder(target: CloudinaryTarget): CloudinaryFolder {
  if (target === "dissemination_details") {
    return "disseminations";
  }

  return "absensi";
}

export type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
};

export type CloudinarySignedUploadParams = {
  apiKey: string;
  cloudName: string;
  folder: CloudinaryFolder;
  signature: string;
  timestamp: number;
  uploadUrl: string;
};

export function createSignedUploadParams(
  target: CloudinaryTarget,
): CloudinarySignedUploadParams {
  const cloudinaryUrl = getCloudinaryUrl(target);

  if (!cloudinaryUrl) {
    throw new Error(`Cloudinary URL for ${target} is not configured`);
  }

  const config = parseCloudinaryUrl(cloudinaryUrl);
  const folder = getCloudinaryFolder(target);
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      folder,
      timestamp,
    },
    config.api_secret,
  );

  return {
    apiKey: config.api_key,
    cloudName: config.cloud_name,
    folder,
    signature,
    timestamp,
    uploadUrl: `https://api.cloudinary.com/v1_1/${config.cloud_name}/image/upload`,
  };
}

export async function deleteImageFromCloudinary(
  publicId: string | null | undefined,
  target: CloudinaryTarget,
) {
  if (!publicId) {
    return;
  }

  configureCloudinary(target);
  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
}
