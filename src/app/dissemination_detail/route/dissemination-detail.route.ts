import { DisseminationDetailController } from "../controller/dissemination-detail.controller";
import {
  createModuleOpenApiDocument,
  createOpenApiRouter,
  registerOpenApiRoute,
  registerDefaultSecuritySchemes,
} from "../../../docs/openapi-common";
import {
  createDisseminationDetailRoute,
  deleteDisseminationDetailRoute,
  getAllDisseminationDetailsRoute,
  getDisseminationDetailByIdRoute,
  getDisseminationDetailsByDisseminationIdRoute,
  updateDisseminationDetailRoute,
} from "./dissemination-detail.openapi";

const router = createOpenApiRouter();

registerDefaultSecuritySchemes(router);

registerOpenApiRoute(router, getAllDisseminationDetailsRoute, DisseminationDetailController.getAll);
registerOpenApiRoute(router, getDisseminationDetailByIdRoute, DisseminationDetailController.getById);
registerOpenApiRoute(
  router,
  getDisseminationDetailsByDisseminationIdRoute,
  DisseminationDetailController.getByDisseminationId,
);
registerOpenApiRoute(router, createDisseminationDetailRoute, DisseminationDetailController.create);
registerOpenApiRoute(router, updateDisseminationDetailRoute, DisseminationDetailController.update);
registerOpenApiRoute(router, deleteDisseminationDetailRoute, DisseminationDetailController.delete);

export function getDisseminationDetailOpenApiDocument(baseUrl: string) {
  return createModuleOpenApiDocument(
    router,
    baseUrl,
    "Dissemination Detail API",
  );
}

export default router;
