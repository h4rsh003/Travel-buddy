import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();

router.post("/register", AuthController.register);

router.post("/login", AuthController.login);

// Verifies the 4-digit code entered by user
router.post("/verify-otp", AuthController.verifyOtp);


export default router;