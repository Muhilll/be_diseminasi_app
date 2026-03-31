import { Hono } from "hono";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/permission";
import { DisseminationController } from "../controller/dissemination.controller";

const router = new Hono();

router.use("/*", jwtMiddleware, appTokenMiddleware);

router.get(
  "/",
  requirePermission("/disseminations", "can_read"),
  DisseminationController.getAll,
);
router.get(
  "/:id",
  requirePermission("/disseminations", "can_read"),
  DisseminationController.getById,
);
router.get(
  "/user/:userId",
  requirePermission("/disseminations", "can_read"),
  DisseminationController.getByUserId,
);
router.post(
  "/",
  requirePermission("/disseminations", "can_create"),
  DisseminationController.create,
);
router.put(
  "/:id",
  requirePermission("/disseminations", "can_update"),
  DisseminationController.update,
);
router.delete(
  "/:id",
  requirePermission("/disseminations", "can_delete"),
  DisseminationController.delete,
);

export default router;
