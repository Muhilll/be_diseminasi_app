import { z } from "@hono/zod-openapi";
import { timestampSchema } from "./openapi-common";

export const roleSchema = z
  .object({
    id: z.number().int().openapi({
      example: 1,
    }),
    code: z.string().openapi({
      example: "ADMIN",
    }),
    name: z.string().openapi({
      example: "Administrator",
    }),
    created_at: timestampSchema,
    updated_at: timestampSchema,
  })
  .openapi("Role");

export const menuSchema = z
  .object({
    id: z.number().int().openapi({
      example: 1,
    }),
    name: z.string().openapi({
      example: "Dashboard",
    }),
    path: z.string().openapi({
      example: "/dashboard",
    }),
    permission_path: z.string().nullable().openapi({
      example: null,
    }),
    icon: z.string().nullable().openapi({
      example: null,
    }),
    parent_id: z.number().int().nullable().openapi({
      example: null,
    }),
    created_at: timestampSchema,
    updated_at: timestampSchema,
  })
  .openapi("Menu");

export const gradeSchema = z
  .object({
    id: z.number().int().openapi({
      example: 1,
    }),
    level: z.number().int().openapi({
      example: 3,
    }),
    grade: z.string().openapi({
      example: "IIIa",
    }),
    des: z.string().nullable().openapi({
      example: "Golongan IIIa",
    }),
    created_at: timestampSchema,
    updated_at: timestampSchema,
  })
  .openapi("Grade");

export const positionSchema = z
  .object({
    id: z.number().int().openapi({
      example: 1,
    }),
    category: z.string().openapi({
      example: "expertise",
      description: 'Common values are "expertise" or "skills".',
    }),
    des: z.string().nullable().openapi({
      example: "Ahli Teknologi Informasi",
    }),
    created_at: timestampSchema,
    updated_at: timestampSchema,
  })
  .openapi("Position");

export const userRoleSummarySchema = z
  .object({
    id: z.number().int().openapi({
      example: 1,
    }),
    code: z.string().openapi({
      example: "ADMIN",
    }),
    name: z.string().openapi({
      example: "Administrator",
    }),
  })
  .openapi("UserRoleSummary");

export const userGradeSummarySchema = z
  .object({
    id: z.number().int().openapi({
      example: 7,
    }),
    level: z.number().int().openapi({
      example: 3,
    }),
    grade: z.string().openapi({
      example: "IIIa",
    }),
    des: z.string().nullable().openapi({
      example: "Golongan IIIa",
    }),
  })
  .openapi("UserGradeSummary");

export const userPositionSummarySchema = z
  .object({
    id: z.number().int().openapi({
      example: 2,
    }),
    category: z.string().openapi({
      example: "skills",
    }),
    des: z.string().nullable().openapi({
      example: "Keterampilan Teknis",
    }),
  })
  .openapi("UserPositionSummary");

export const userLightSchema = z
  .object({
    id: z.number().int().openapi({
      example: 1,
    }),
    email: z.string().email().openapi({
      example: "admin@diseminasi.com",
    }),
    employee_id: z.string().nullable().openapi({
      example: "ADM001",
    }),
    name: z.string().openapi({
      example: "Admin User",
    }),
    grade_id: z.number().int().openapi({
      example: 7,
    }),
    position_id: z.number().int().openapi({
      example: 2,
    }),
    signature_image: z.string().nullable().openapi({
      example: "https://res.cloudinary.com/example/signature.png",
    }),
    role_id: z.number().int().openapi({
      example: 1,
    }),
  })
  .openapi("UserLight");

export const userSchema = z
  .object({
    id: z.number().int().openapi({
      example: 1,
    }),
    email: z.string().email().openapi({
      example: "admin@diseminasi.com",
    }),
    employee_id: z.string().nullable().openapi({
      example: "ADM001",
    }),
    name: z.string().openapi({
      example: "Admin User",
    }),
    grade_id: z.number().int().openapi({
      example: 7,
    }),
    position_id: z.number().int().openapi({
      example: 2,
    }),
    signature_image: z.string().nullable().openapi({
      example: "https://res.cloudinary.com/example/signature.png",
    }),
    role_id: z.number().int().openapi({
      example: 1,
    }),
    created_at: timestampSchema,
    updated_at: timestampSchema,
    role: userRoleSummarySchema,
    grade: userGradeSummarySchema,
    position: userPositionSummarySchema,
  })
  .openapi("User");

export const navigationPermissionSchema = z
  .object({
    can_read: z.boolean().openapi({
      example: true,
    }),
    can_create: z.boolean().openapi({
      example: true,
    }),
    can_update: z.boolean().openapi({
      example: true,
    }),
    can_delete: z.boolean().openapi({
      example: false,
    }),
    can_report: z.boolean().openapi({
      example: false,
    }),
  })
  .openapi("NavigationPermission");

export const navigationItemSchema: z.ZodTypeAny = z
  .object({
    id: z.number().int().openapi({
      example: 2,
    }),
    name: z.string().openapi({
      example: "Master Data",
    }),
    path: z.string().openapi({
      example: "/master-data",
    }),
    icon: z.string().nullable().openapi({
      example: null,
    }),
    parent_id: z.number().int().nullable().openapi({
      example: null,
    }),
    permissions: navigationPermissionSchema,
    children: z.array(z.lazy(() => navigationItemSchema)),
  })
  .openapi("NavigationItem");

export const rolePermissionSchema = z
  .object({
    id: z.number().int().openapi({
      example: 1,
    }),
    role_id: z.number().int().openapi({
      example: 1,
    }),
    menu_id: z.number().int().openapi({
      example: 2,
    }),
    can_read: z.boolean().openapi({
      example: true,
    }),
    can_create: z.boolean().openapi({
      example: true,
    }),
    can_update: z.boolean().openapi({
      example: true,
    }),
    can_delete: z.boolean().openapi({
      example: true,
    }),
    can_report: z.boolean().openapi({
      example: true,
    }),
    created_at: timestampSchema,
    updated_at: timestampSchema,
    role: userRoleSummarySchema,
    menu: z.object({
      id: z.number().int().openapi({
        example: 2,
      }),
      name: z.string().openapi({
        example: "Master Data",
      }),
      path: z.string().openapi({
        example: "/master-data",
      }),
      permission_path: z.string().nullable().openapi({
        example: null,
      }),
      icon: z.string().nullable().openapi({
        example: null,
      }),
      parent_id: z.number().int().nullable().openapi({
        example: null,
      }),
    }),
  })
  .openapi("RolePermission");

export const disseminationSchema = z
  .object({
    id: z.number().int().openapi({
      example: 1,
    }),
    title: z.string().openapi({
      example: "Sosialisasi Program 2026",
    }),
    province: z.string().openapi({
      example: "Sulawesi Selatan",
    }),
    city: z.string().openapi({
      example: "Makassar",
    }),
    district: z.string().openapi({
      example: "Panakkukang",
    }),
    village: z.string().openapi({
      example: "Masale",
    }),
    date: timestampSchema,
    user_id: z.number().int().openapi({
      example: 1,
    }),
    created_at: timestampSchema,
    updated_at: timestampSchema,
    user: userLightSchema,
  })
  .openapi("Dissemination");

export const disseminationDetailSchema = z
  .object({
    id: z.number().int().openapi({
      example: 1,
    }),
    disseminations_id: z.number().int().openapi({
      example: 1,
    }),
    basis: z.string().nullable().openapi({
      example: "Surat Tugas Nomor 001",
    }),
    material: z.string().nullable().openapi({
      example: "Materi sosialisasi",
    }),
    date: z.string().datetime().nullable().openapi({
      example: "2026-04-27T10:00:00.000Z",
    }),
    location: z.string().nullable().openapi({
      example: "Balai Pertemuan Kelurahan",
    }),
    methode: z.string().nullable().openapi({
      example: "Offline",
    }),
    participants: z.string().nullable().openapi({
      example: "Perangkat Kelurahan dan warga",
    }),
    result: z.string().nullable().openapi({
      example: "Peserta memahami alur layanan",
    }),
    image: z.string().nullable().openapi({
      example: "https://res.cloudinary.com/example/image.jpg",
    }),
    image_public_id: z.string().nullable().openapi({
      example: "disseminations/example-image",
    }),
    created_at: timestampSchema,
    updated_at: timestampSchema,
  })
  .openapi("DisseminationDetail");

export const absensiSchema = z
  .object({
    id: z.number().int().openapi({
      example: 1,
    }),
    gambar: z.string().nullable().openapi({
      example: "https://res.cloudinary.com/example/absensi.jpg",
    }),
    gambar_public_id: z.string().nullable().openapi({
      example: "absensi/example-absensi",
    }),
    des: z.string().nullable().openapi({
      example: "Absensi kegiatan lapangan",
    }),
    user_id: z.number().int().openapi({
      example: 1,
    }),
    created_at: timestampSchema,
    updated_at: timestampSchema,
    user: userLightSchema,
  })
  .openapi("Absensi");

export const uploadSignatureResponseSchema = z
  .object({
    target: z.enum(["absensi", "dissemination_details"]).openapi({
      example: "absensi",
    }),
    apiKey: z.string().openapi({
      example: "123456789012345",
    }),
    cloudName: z.string().openapi({
      example: "my-cloud",
    }),
    folder: z.enum(["absensi", "disseminations"]).openapi({
      example: "absensi",
    }),
    signature: z.string().openapi({
      example: "c1d2e3f4",
    }),
    timestamp: z.number().int().openapi({
      example: 1770000000,
    }),
    uploadUrl: z.string().url().openapi({
      example: "https://api.cloudinary.com/v1_1/my-cloud/image/upload",
    }),
  })
  .openapi("UploadSignatureResponse");
