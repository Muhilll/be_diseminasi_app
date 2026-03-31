import { Hono } from "hono";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/permission";
import { DisseminationDetailController } from "../controller/dissemination-detail.controller";

const router = new Hono();

router.use("/*", jwtMiddleware, appTokenMiddleware);

router.get(
  "/",
  // requirePermission("/dissemination-details", "can_read"),
  DisseminationDetailController.getAll,
);
router.get(
  "/:id",
  // requirePermission("/dissemination-details", "can_read"),
  DisseminationDetailController.getById,
);
router.get(
  "/dissemination/:disseminationId",
  // requirePermission("/dissemination-details", "can_read"),
  DisseminationDetailController.getByDisseminationId,
);
router.post(
  "/",
  // requirePermission("/dissemination-details", "can_create"),
  DisseminationDetailController.create,
);
router.put(
  "/:id",
  // requirePermission("/dissemination-details", "can_update"),
  DisseminationDetailController.update,
);
router.delete(
  "/:id",
  // requirePermission("/dissemination-details", "can_delete"),
  DisseminationDetailController.delete,
);

export default router;
