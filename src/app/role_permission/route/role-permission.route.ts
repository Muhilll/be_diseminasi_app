import { Hono } from "hono";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/permission";
import { RolePermissionController } from "../controller/role-permission.controller";

const router = new Hono();

router.use("/*", jwtMiddleware, appTokenMiddleware);

router.get(
  "/",
  requirePermission("/web-management/role-permissions", "can_read"),
  RolePermissionController.getAll,
);
router.get(
  "/:id",
  requirePermission("/web-management/role-permissions", "can_read"),
  RolePermissionController.getById,
);
router.get(
  "/role/:roleId",
  requirePermission("/web-management/role-permissions", "can_read"),
  RolePermissionController.getByRoleId,
);
router.post(
  "/",
  requirePermission("/web-management/role-permissions", "can_create"),
  RolePermissionController.create,
);
router.put(
  "/:id",
  requirePermission("/web-management/role-permissions", "can_update"),
  RolePermissionController.update,
);
router.delete(
  "/:id",
  requirePermission("/web-management/role-permissions", "can_delete"),
  RolePermissionController.delete,
);

export default router;
