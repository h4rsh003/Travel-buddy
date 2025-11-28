import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// PUT /api/users/profile
// Protected by authMiddleware
router.put("/profile", authMiddleware, UserController.updateProfile);

// GET /api/users/profile
router.get("/profile", authMiddleware, UserController.getProfile);

export default router;