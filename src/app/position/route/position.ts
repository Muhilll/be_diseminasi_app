import { Hono } from "hono";
import { PositionController } from "../controller/position";
import { jwtMiddleware } from "../../../middleware/auth";
import { appTokenMiddleware } from "../../../middleware/appToken";

const router = new Hono();

// All position endpoints require JWT
router.use("/*", jwtMiddleware, appTokenMiddleware);

// GET all positions
router.get("/", PositionController.getAll);

// GET position by ID
router.get("/:id", PositionController.getById);

// POST create new position
router.post("/", PositionController.create);

// PUT update position
router.put("/:id", PositionController.update);

// DELETE position
router.delete("/:id", PositionController.delete);

export default router;
