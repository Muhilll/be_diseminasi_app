import { Hono } from "hono";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { PositionController } from "../controller/position.controller";

const router = new Hono();

router.use("/*", jwtMiddleware, appTokenMiddleware);

router.get("/", PositionController.getAll);
router.get("/:id", PositionController.getById);
router.post("/", PositionController.create);
router.put("/:id", PositionController.update);
router.delete("/:id", PositionController.delete);

export default router;
