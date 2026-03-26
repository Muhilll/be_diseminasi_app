import { Hono } from "hono";
import { MenuController } from "../controller/menu";
import { jwtMiddleware } from "../../../middleware/auth";
import { appTokenMiddleware } from "../../../middleware/appToken";

const router = new Hono();

// All menu endpoints require JWT
router.use("/*", jwtMiddleware, appTokenMiddleware);

// GET all menus
router.get("/", MenuController.getAll);

// GET menu by ID
router.get("/:id", MenuController.getById);

// POST create new menu
router.post("/", MenuController.create);

// PUT update menu
router.put("/:id", MenuController.update);

// DELETE menu
router.delete("/:id", MenuController.delete);

export default router;
