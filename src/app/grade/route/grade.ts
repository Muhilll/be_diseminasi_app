import { Hono } from "hono";
import { GradeController } from "../controller/grade";
import { jwtMiddleware } from "../../../middleware/auth";
import { appTokenMiddleware } from "../../../middleware/appToken";

const router = new Hono();

// All grade endpoints require JWT
router.use("/*", jwtMiddleware, appTokenMiddleware);

// GET all grades
router.get("/", GradeController.getAll);

// GET grade by ID
router.get("/:id", GradeController.getById);

// POST create new grade
router.post("/", GradeController.create);

// PUT update grade
router.put("/:id", GradeController.update);

// DELETE grade
router.delete("/:id", GradeController.delete);

export default router;
