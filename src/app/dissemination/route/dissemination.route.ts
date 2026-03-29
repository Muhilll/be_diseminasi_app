import { Hono } from "hono";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { DisseminationController } from "../controller/dissemination.controller";

const router = new Hono();

router.use("/*", jwtMiddleware, appTokenMiddleware);

router.get("/", DisseminationController.getAll);
router.get("/:id", DisseminationController.getById);
router.get("/user/:userId", DisseminationController.getByUserId);
router.post("/", DisseminationController.create);
router.put("/:id", DisseminationController.update);
router.delete("/:id", DisseminationController.delete);

export default router;
