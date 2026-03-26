import { Hono } from "hono";
import { RolePermissionController } from "../controller/role_permission";
import { jwtMiddleware } from "../../../middleware/auth";
import { appTokenMiddleware } from "../../../middleware/appToken";

const router = new Hono();

// All role permission endpoints require JWT
router.use("/*", jwtMiddleware, appTokenMiddleware);

// GET all role permissions
router.get("/", RolePermissionController.getAll);

// GET role permission by ID
router.get("/:id", RolePermissionController.getById);

// GET permissions by role ID
router.get("/role/:roleId", RolePermissionController.getByRoleId);

// POST create new role permission
router.post("/", RolePermissionController.create);

// PUT update role permission
router.put("/:id", RolePermissionController.update);

// DELETE role permission
router.delete("/:id", RolePermissionController.delete);

export default router;
