import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();

// Route: POST /api/auth/register
router.post("/register", AuthController.register);

// Route: POST /api/auth/login
router.post("/login", AuthController.login);

// Route: POST /api/auth/google-login
router.post("/google-login", AuthController.googleLogin);

export default router;