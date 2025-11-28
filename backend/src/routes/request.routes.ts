import { Router } from "express";
import { RequestController } from "../controllers/request.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// POST /api/requests/send
router.post("/send", authMiddleware, RequestController.sendRequest);

// PATCH /api/requests/:requestId/:status (e.g. /12/accepted)
router.patch("/:requestId/:status", authMiddleware, RequestController.handleRequestStatus);

export default router;