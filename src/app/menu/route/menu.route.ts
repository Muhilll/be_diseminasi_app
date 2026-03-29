import { Hono } from "hono";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { MenuController } from "../controller/menu.controller";

const router = new Hono();

router.use("/*", jwtMiddleware, appTokenMiddleware);

router.get("/", MenuController.getAll);
router.get("/:id", MenuController.getById);
router.post("/", MenuController.create);
router.put("/:id", MenuController.update);
router.delete("/:id", MenuController.delete);

export default router;
