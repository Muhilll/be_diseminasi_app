import { Hono } from "hono";
import { UserController } from "../controller/user";
import { jwtMiddleware } from "../../../middleware/auth";
import { appTokenMiddleware } from "../../../middleware/appToken";

const router = new Hono();

// Public endpoint - Login
router.post("/login", UserController.login);

// Protected endpoints - Require JWT
router.use("/*", jwtMiddleware, appTokenMiddleware);

// GET all users
router.get("/", UserController.getAll);

// GET current user navigation
router.get("/me/navigation", UserController.getNavigation);

// GET user by ID
router.get("/:id", UserController.getById);

// POST create new user
router.post("/", UserController.create);

// PUT update user
router.put("/:id", UserController.update);

// DELETE user
router.delete("/:id", UserController.delete);

export default router;
