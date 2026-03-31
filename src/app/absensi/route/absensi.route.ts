import { Hono } from "hono";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { AbsensiController } from "../controller/absensi.controller";

const router = new Hono();

router.use("/*", jwtMiddleware, appTokenMiddleware);

router.get("/", AbsensiController.getAll);
router.get("/:id", AbsensiController.getById);
router.get("/user/:userId", AbsensiController.getByUserId);
router.post("/", AbsensiController.create);
router.put("/:id", AbsensiController.update);
router.delete("/:id", AbsensiController.delete);

export default router;
