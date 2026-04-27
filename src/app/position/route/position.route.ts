import { PositionController } from "../controller/position.controller";
import {
  createPositionRoute,
  deletePositionRoute,
  getAllPositionsRoute,
  getPositionByIdRoute,
  updatePositionRoute,
} from "./position.openapi";
import {
  createModuleOpenApiDocument,
  createOpenApiRouter,
  registerOpenApiRoute,
  registerDefaultSecuritySchemes,
} from "../../../docs/openapi-common";

const router = createOpenApiRouter();

registerDefaultSecuritySchemes(router);

registerOpenApiRoute(router, getAllPositionsRoute, PositionController.getAll);
registerOpenApiRoute(router, getPositionByIdRoute, PositionController.getById);
registerOpenApiRoute(router, createPositionRoute, PositionController.create);
registerOpenApiRoute(router, updatePositionRoute, PositionController.update);
registerOpenApiRoute(router, deletePositionRoute, PositionController.delete);

export function getPositionOpenApiDocument(baseUrl: string) {
  return createModuleOpenApiDocument(router, baseUrl, "Position API");
}

export default router;