import { Router } from "express";
import { TripController } from "../controllers/trip.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// POST /api/trips (Create a new trip)
router.post("/", authMiddleware, TripController.createTrip);

// GET /api/trips
router.get("/", TripController.getAllTrips);

export default router;