import { Hono } from "hono";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { UploadController } from "../controller/upload.controller";

const router = new Hono();

router.use("/*", jwtMiddleware, appTokenMiddleware);

router.post("/signature", UploadController.createSignature);

export default router;
