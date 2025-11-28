import { Router } from "express";
import { RequestController } from "../controllers/request.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// POST /api/requests/send
router.post("/send", authMiddleware, RequestController.sendRequest);

export default router;