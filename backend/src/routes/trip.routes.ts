import { Router } from "express";
import { TripController } from "../controllers/trip.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// POST /api/trips (Create a new trip)
router.post("/", authMiddleware, TripController.createTrip);

export default router;