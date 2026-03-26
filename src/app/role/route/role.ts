import { Hono } from "hono";
import { RoleController } from "../controller/role";
import { jwtMiddleware } from "../../../middleware/auth";

const router = new Hono();

// All role endpoints require JWT
router.use("/*", jwtMiddleware);

// GET all roles
router.get("/", RoleController.getAll);

// GET role by ID
router.get("/:id", RoleController.getById);

// POST create new role
router.post("/", RoleController.create);

// PUT update role
router.put("/:id", RoleController.update);

// DELETE role
router.delete("/:id", RoleController.delete);

export default router;
