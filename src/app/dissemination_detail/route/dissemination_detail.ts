import { Hono } from "hono";
import { DisseminationDetailController } from "../controller/dissemination_detail";
import { jwtMiddleware } from "../../../middleware/auth";
import { appTokenMiddleware } from "../../../middleware/appToken";

const router = new Hono();

// All dissemination detail endpoints require JWT
router.use("/*", jwtMiddleware, appTokenMiddleware);

// GET all dissemination details
router.get("/", DisseminationDetailController.getAll);

// GET dissemination detail by ID
router.get("/:id", DisseminationDetailController.getById);

// GET details by dissemination ID
router.get("/dissemination/:disseminationId", DisseminationDetailController.getByDisseminationId);

// POST create new dissemination detail
router.post("/", DisseminationDetailController.create);

// PUT update dissemination detail
router.put("/:id", DisseminationDetailController.update);

// DELETE dissemination detail
router.delete("/:id", DisseminationDetailController.delete);

export default router;
