import { v2 as cloudinary } from "cloudinary";

type CloudinaryTarget = "dissemination_details" | "absensi";

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

function isRemoteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

async function fileToDataUri(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return `data:${file.type || "application/octet-stream"};base64,${base64}`;
}

export type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
};

export async function uploadImageToCloudinary(
  file: string | File | undefined,
  folder: string,
  target: CloudinaryTarget,
): Promise<CloudinaryUploadResult | undefined> {
  if (!file) {
    return undefined;
  }
  configureCloudinary(target);

  if (file instanceof File) {
    const dataUri = await fileToDataUri(file);
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: "image",
    });

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  }

  if (isRemoteUrl(file)) {
    return {
      secure_url: file,
      public_id: "",
    };
  }

  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "image",
  });

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
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
