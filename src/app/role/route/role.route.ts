import { Hono } from "hono";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { RoleController } from "../controller/role.controller";

const router = new Hono();

router.use("/*", jwtMiddleware, appTokenMiddleware);

router.get("/", RoleController.getAll);
router.get("/:id", RoleController.getById);
router.post("/", RoleController.create);
router.put("/:id", RoleController.update);
router.delete("/:id", RoleController.delete);

export default router;
