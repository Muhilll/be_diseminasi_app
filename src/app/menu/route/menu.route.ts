import { Hono } from "hono";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/permission";
import { MenuController } from "../controller/menu.controller";

const router = new Hono();

router.use("/*", jwtMiddleware, appTokenMiddleware);

router.get(
  "/",
  requirePermission("/web-management/menus", "can_read"),
  MenuController.getAll,
);
router.get(
  "/:id",
  requirePermission("/web-management/menus", "can_read"),
  MenuController.getById,
);
router.post(
  "/",
  requirePermission("/web-management/menus", "can_create"),
  MenuController.create,
);
router.put(
  "/:id",
  requirePermission("/web-management/menus", "can_update"),
  MenuController.update,
);
router.delete(
  "/:id",
  requirePermission("/web-management/menus", "can_delete"),
  MenuController.delete,
);

export default router;
