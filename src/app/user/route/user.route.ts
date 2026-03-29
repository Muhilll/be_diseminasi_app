import { Hono } from "hono";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { UserAuthController } from "../controller/user-auth.controller";
import { UserNavigationController } from "../controller/user-navigation.controller";
import { UserController } from "../controller/user.controller";

const router = new Hono();

router.post("/login", UserAuthController.login);

router.use("/*", jwtMiddleware, appTokenMiddleware);

router.get("/", UserController.getAll);
router.get("/me/navigation", UserNavigationController.getNavigation);
router.get("/:id", UserController.getById);
router.post("/", UserController.create);
router.put("/:id", UserController.update);
router.delete("/:id", UserController.delete);

export default router;
