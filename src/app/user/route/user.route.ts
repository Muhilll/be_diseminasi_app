import { Hono } from "hono";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/permission";
import { UserAuthController } from "../controller/user-auth.controller";
import { UserNavigationController } from "../controller/user-navigation.controller";
import { UserController } from "../controller/user.controller";

const router = new Hono();

router.post("/login", UserAuthController.login);

router.use("/*", jwtMiddleware, appTokenMiddleware);

router.get(
  "/",
  requirePermission("/master-data/users", "can_read"),
  UserController.getAll,
);
router.get("/me/navigation", UserNavigationController.getNavigation);
router.get(
  "/:id",
  requirePermission("/master-data/users", "can_read"),
  UserController.getById,
);
router.post(
  "/",
  requirePermission("/master-data/users", "can_create"),
  UserController.create,
);
router.put(
  "/:id",
  requirePermission("/master-data/users", "can_update"),
  UserController.update,
);
router.delete(
  "/:id",
  requirePermission("/master-data/users", "can_delete"),
  UserController.delete,
);

export default router;
