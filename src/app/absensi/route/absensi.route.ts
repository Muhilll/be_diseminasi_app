import { AbsensiController } from "../controller/absensi.controller";
import {
  createModuleOpenApiDocument,
  createOpenApiRouter,
  registerOpenApiRoute,
  registerDefaultSecuritySchemes,
} from "../../../docs/openapi-common";
import {
  createAbsensiRoute,
  deleteAbsensiRoute,
  getAbsensiByIdRoute,
  getAbsensisByUserIdRoute,
  getAllAbsensisRoute,
  updateAbsensiRoute,
} from "./absensi.openapi";

const router = createOpenApiRouter();

registerDefaultSecuritySchemes(router);

registerOpenApiRoute(router, getAllAbsensisRoute, AbsensiController.getAll);
registerOpenApiRoute(router, getAbsensiByIdRoute, AbsensiController.getById);
registerOpenApiRoute(router, getAbsensisByUserIdRoute, AbsensiController.getByUserId);
registerOpenApiRoute(router, createAbsensiRoute, AbsensiController.create);
registerOpenApiRoute(router, updateAbsensiRoute, AbsensiController.update);
registerOpenApiRoute(router, deleteAbsensiRoute, AbsensiController.delete);

export function getAbsensiOpenApiDocument(baseUrl: string) {
  return createModuleOpenApiDocument(router, baseUrl, "Absensi API");
}

export default router;
