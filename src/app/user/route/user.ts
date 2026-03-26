import { Hono } from "hono";
import { UserController } from "../controller/user";
import { jwtMiddleware } from "../../../middleware/auth";

const router = new Hono();

// Public endpoint - Login
router.post("/login", UserController.login);

// Protected endpoints - Require JWT
router.use("/*", jwtMiddleware);

// GET all users
router.get("/", UserController.getAll);

// GET user by ID
router.get("/:id", UserController.getById);

// POST create new user
router.post("/", UserController.create);

// PUT update user
router.put("/:id", UserController.update);

// DELETE user
router.delete("/:id", UserController.delete);

export default router;
