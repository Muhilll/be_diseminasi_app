import { Hono } from "hono";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { DisseminationDetailController } from "../controller/dissemination-detail.controller";

const router = new Hono();

router.use("/*", jwtMiddleware, appTokenMiddleware);

router.get("/", DisseminationDetailController.getAll);
router.get("/:id", DisseminationDetailController.getById);
router.get(
  "/dissemination/:disseminationId",
  DisseminationDetailController.getByDisseminationId,
);
router.post("/", DisseminationDetailController.create);
router.put("/:id", DisseminationDetailController.update);
router.delete("/:id", DisseminationDetailController.delete);

export default router;
