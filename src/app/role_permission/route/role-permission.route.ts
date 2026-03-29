import { Hono } from "hono";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { RolePermissionController } from "../controller/role-permission.controller";

const router = new Hono();

router.use("/*", jwtMiddleware, appTokenMiddleware);

router.get("/", RolePermissionController.getAll);
router.get("/:id", RolePermissionController.getById);
router.get("/role/:roleId", RolePermissionController.getByRoleId);
router.post("/", RolePermissionController.create);
router.put("/:id", RolePermissionController.update);
router.delete("/:id", RolePermissionController.delete);

export default router;
