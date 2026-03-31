import { Hono } from "hono";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/permission";
import { RoleController } from "../controller/role.controller";

const router = new Hono();

router.use("/*", jwtMiddleware, appTokenMiddleware);

router.get(
  "/",
  requirePermission("/master-data/roles", "can_read"),
  RoleController.getAll,
);
router.get(
  "/:id",
  requirePermission("/master-data/roles", "can_read"),
  RoleController.getById,
);
router.post(
  "/",
  requirePermission("/master-data/roles", "can_create"),
  RoleController.create,
);
router.put(
  "/:id",
  requirePermission("/master-data/roles", "can_update"),
  RoleController.update,
);
router.delete(
  "/:id",
  requirePermission("/master-data/roles", "can_delete"),
  RoleController.delete,
);

export default router;
