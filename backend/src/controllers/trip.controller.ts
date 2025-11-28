import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Trip } from "../entities/Trip";
import { User } from "../entities/User";
import { TripValidation } from "../validations/trip.validation";

export class TripController {
  
  // 1. Create Trip
  static async createTrip(req: Request, res: Response): Promise<any> {
    try {
      const { userId } = req.body.user; // From Middleware
      const { destination, startDate, endDate, budget, description } = req.body;

      // Validate Input
      const validation = TripValidation.createTrip.safeParse({ 
        destination, startDate, endDate, budget, description 
      });
      
      if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
      }

      const tripRepository = AppDataSource.getRepository(Trip);
      const userRepository = AppDataSource.getRepository(User);

      // Find the User
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) return res.status(404).json({ message: "User not found" });

      // Create Trip & Link to User
      const trip = new Trip();
      trip.destination = destination;
      trip.startDate = startDate;
      trip.endDate = endDate;
      trip.budget = budget;
      trip.description = description;
      trip.user = user; 

      await tripRepository.save(trip);

      return res.status(201).json({ message: "Trip created successfully!", trip });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // 2. Get All Trips (Public Feed)
  static async getAllTrips(req: Request, res: Response): Promise<any> {
    try {
      const tripRepository = AppDataSource.getRepository(Trip);

      const trips = await tripRepository.find({
        order: { created_at: "DESC" }, 
        relations: ["user"], 
        select: {
            user: {
                id: true,
                name: true,
                email: true,
                profile_image: true
            }
        }
      });

      return res.status(200).json(trips);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // 3. Get Single Trip by ID (Updated for Contact Reveal)
  static async getTripById(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params; 
      const tripRepository = AppDataSource.getRepository(Trip);

      const trip = await tripRepository.findOne({
        where: { id: Number(id) },
        // 👇 ADDED "joinRequests" so we can check if current user is accepted
        relations: ["user", "joinRequests"], 
        select: {
            user: {
                id: true,
                name: true,
                email: true, // Needed for contact reveal
                profile_image: true,
                bio: true 
            },
            // 👇 Select minimal info to check status
            joinRequests: {
                userId: true,
                status: true
            }
        }
      });

      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }

      return res.status(200).json(trip);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // 4. Get Logged-In User's Trips (Fixed Errors)
  static async getMyTrips(req: Request, res: Response): Promise<any> {
    try {
      const { userId } = req.body.user; 

      const tripRepository = AppDataSource.getRepository(Trip);

      // 🛠️ FIXED: Use .find() and filter by userId (not id)
      const trips = await tripRepository.find({
        where: { userId: userId }, // 👈 Correct filter
        order: { created_at: "DESC" },
        relations: ["joinRequests", "joinRequests.user"], 
        select: {
            joinRequests: {
                id: true,
                status: true,
                user: {
                    id: true,
                    name: true,
                    email: true,
                    profile_image: true
                }
            }
        }
      });

      // 🛠️ FIXED: Returning 'trips' (plural) matches variable above
      return res.status(200).json(trips);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  // Delete Trip
  static async deleteTrip(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const { userId } = req.body.user; // Me

      const tripRepository = AppDataSource.getRepository(Trip);
      
      const trip = await tripRepository.findOne({ where: { id: Number(id) } });

      if (!trip) return res.status(404).json({ message: "Trip not found" });

      // Security: Check Ownership
      if (trip.userId !== userId) {
        return res.status(403).json({ message: "You are not authorized to delete this trip" });
      }

      // Delete the trip
      await tripRepository.remove(trip);

      return res.status(200).json({ message: "Trip deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}