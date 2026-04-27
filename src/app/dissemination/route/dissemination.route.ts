import { DisseminationController } from "../controller/dissemination.controller";
import {
  createModuleOpenApiDocument,
  createOpenApiRouter,
  registerOpenApiRoute,
  registerDefaultSecuritySchemes,
} from "../../../docs/openapi-common";
import {
  createDisseminationRoute,
  deleteDisseminationRoute,
  getAllDisseminationsRoute,
  getDisseminationByIdRoute,
  getDisseminationsByUserIdRoute,
  updateDisseminationRoute,
} from "./dissemination.openapi";

const router = createOpenApiRouter();

registerDefaultSecuritySchemes(router);

registerOpenApiRoute(router, getAllDisseminationsRoute, DisseminationController.getAll);
registerOpenApiRoute(router, getDisseminationByIdRoute, DisseminationController.getById);
registerOpenApiRoute(
  router,
  getDisseminationsByUserIdRoute,
  DisseminationController.getByUserId,
);
registerOpenApiRoute(router, createDisseminationRoute, DisseminationController.create);
registerOpenApiRoute(router, updateDisseminationRoute, DisseminationController.update);
registerOpenApiRoute(router, deleteDisseminationRoute, DisseminationController.delete);

export function getDisseminationOpenApiDocument(baseUrl: string) {
  return createModuleOpenApiDocument(router, baseUrl, "Dissemination API");
}

export default router;
