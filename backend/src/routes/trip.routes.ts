import { Router } from "express";
import { TripController } from "../controllers/trip.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// POST /api/trips (Create a new trip)
router.post("/", authMiddleware, TripController.createTrip);

// GET /api/trips
router.get("/", TripController.getAllTrips);

// GET /api/trips/:id
router.get("/:id", TripController.getTripById);

// GET /api/trips/user/me (My Dashboard)
router.get("/user/me", authMiddleware, TripController.getMyTrips);

// GET /api/trips/:id (Keep this at the bottom)
router.get("/:id", TripController.getTripById);

export default router;