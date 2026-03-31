import { Hono } from "hono";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/permission";
import { AbsensiController } from "../controller/absensi.controller";

const router = new Hono();

router.use("/*", jwtMiddleware, appTokenMiddleware);

router.get(
  "/",
  requirePermission("/absensis", "can_read"),
  AbsensiController.getAll,
);
router.get(
  "/:id",
  requirePermission("/absensis", "can_read"),
  AbsensiController.getById,
);
router.get(
  "/user/:userId",
  requirePermission("/absensis", "can_read"),
  AbsensiController.getByUserId,
);
router.post(
  "/",
  requirePermission("/absensis", "can_create"),
  AbsensiController.create,
);
router.put(
  "/:id",
  requirePermission("/absensis", "can_update"),
  AbsensiController.update,
);
router.delete(
  "/:id",
  requirePermission("/absensis", "can_delete"),
  AbsensiController.delete,
);

export default router;
