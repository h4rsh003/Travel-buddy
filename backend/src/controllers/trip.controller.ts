import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Trip } from "../entities/Trip";
import { User } from "../entities/User";
import { TripValidation } from "../validations/trip.validation";

export class TripController {
  static async createTrip(req: Request, res: Response): Promise<any> {
    try {
      const { userId } = req.body.user; // From Middleware
      const { destination, startDate, endDate, budget, description } = req.body;

      // 1. Validate Input
      const validation = TripValidation.createTrip.safeParse({ 
        destination, startDate, endDate, budget, description 
      });
      
      if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
      }

      const tripRepository = AppDataSource.getRepository(Trip);
      const userRepository = AppDataSource.getRepository(User);

      // 2. Find the User (Owner of the trip)
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) return res.status(404).json({ message: "User not found" });

      // 3. Create Trip & Link to User
      const trip = new Trip();
      trip.destination = destination;
      trip.startDate = startDate;
      trip.endDate = endDate;
      trip.budget = budget;
      trip.description = description;
      trip.user = user; // 🔗 THIS IS THE RELATIONSHIP LINK!

      await tripRepository.save(trip);

      return res.status(201).json({ message: "Trip created successfully!", trip });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}