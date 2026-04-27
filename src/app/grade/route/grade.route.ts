import { GradeController } from "../controller/grade.controller";
import {
  createModuleOpenApiDocument,
  createOpenApiRouter,
  registerOpenApiRoute,
  registerDefaultSecuritySchemes,
} from "../../../docs/openapi-common";
import {
  createGradeRoute,
  deleteGradeRoute,
  getAllGradesRoute,
  getGradeByIdRoute,
  updateGradeRoute,
} from "./grade.openapi";

const router = createOpenApiRouter();

registerDefaultSecuritySchemes(router);

registerOpenApiRoute(router, getAllGradesRoute, GradeController.getAll);
registerOpenApiRoute(router, getGradeByIdRoute, GradeController.getById);
registerOpenApiRoute(router, createGradeRoute, GradeController.create);
registerOpenApiRoute(router, updateGradeRoute, GradeController.update);
registerOpenApiRoute(router, deleteGradeRoute, GradeController.delete);

export function getGradeOpenApiDocument(baseUrl: string) {
  return createModuleOpenApiDocument(router, baseUrl, "Grade API");
}

export default router;
