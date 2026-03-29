import { Hono } from "hono";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { GradeController } from "../controller/grade.controller";

const router = new Hono();

router.use("/*", jwtMiddleware, appTokenMiddleware);

router.get("/", GradeController.getAll);
router.get("/:id", GradeController.getById);
router.post("/", GradeController.create);
router.put("/:id", GradeController.update);
router.delete("/:id", GradeController.delete);

export default router;
