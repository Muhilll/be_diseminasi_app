import { Hono } from "hono";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/permission";
import { GradeController } from "../controller/grade.controller";

const router = new Hono();

router.use("/*", jwtMiddleware, appTokenMiddleware);

router.get(
  "/",
  requirePermission("/master-data/grades", "can_read"),
  GradeController.getAll,
);
router.get(
  "/:id",
  requirePermission("/master-data/grades", "can_read"),
  GradeController.getById,
);
router.post(
  "/",
  requirePermission("/master-data/grades", "can_create"),
  GradeController.create,
);
router.put(
  "/:id",
  requirePermission("/master-data/grades", "can_update"),
  GradeController.update,
);
router.delete(
  "/:id",
  requirePermission("/master-data/grades", "can_delete"),
  GradeController.delete,
);

export default router;
