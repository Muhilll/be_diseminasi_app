import { Hono } from "hono";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/permission";
import { PositionController } from "../controller/position.controller";

const router = new Hono();

router.use("/*", jwtMiddleware, appTokenMiddleware);

router.get(
  "/",
  requirePermission("/master-data/positions", "can_read"),
  PositionController.getAll,
);
router.get(
  "/:id",
  requirePermission("/master-data/positions", "can_read"),
  PositionController.getById,
);
router.post(
  "/",
  requirePermission("/master-data/positions", "can_create"),
  PositionController.create,
);
router.put(
  "/:id",
  requirePermission("/master-data/positions", "can_update"),
  PositionController.update,
);
router.delete(
  "/:id",
  requirePermission("/master-data/positions", "can_delete"),
  PositionController.delete,
);

export default router;
