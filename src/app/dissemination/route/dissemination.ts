import { Hono } from "hono";
import { DisseminationController } from "../controller/dissemination";
import { jwtMiddleware } from "../../../middleware/auth";
import { appTokenMiddleware } from "../../../middleware/appToken";

const router = new Hono();

// All dissemination endpoints require JWT
router.use("/*", jwtMiddleware, appTokenMiddleware);

// GET all disseminations
router.get("/", DisseminationController.getAll);

// GET dissemination by ID
router.get("/:id", DisseminationController.getById);

// GET disseminations by user ID
router.get("/user/:userId", DisseminationController.getByUserId);

// POST create new dissemination
router.post("/", DisseminationController.create);

// PUT update dissemination
router.put("/:id", DisseminationController.update);

// DELETE dissemination
router.delete("/:id", DisseminationController.delete);

export default router;
