import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { UserValidation } from "../validations/user.validation";

export class UserController {
  static async updateProfile(req: Request, res: Response): Promise<any> {
    try {
      const { userId } = req.body.user; // We will get this from the Token Middleware later
      const { bio, location, interests } = req.body;

      // 1. Validate Input
      const validation = UserValidation.updateProfile.safeParse({ bio, location, interests });
      if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
      }

      const userRepository = AppDataSource.getRepository(User);
      
      // 2. Find User
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // 3. Update Fields
      if (bio) user.bio = bio;
      if (location) user.location = location;
      if (interests) user.interests = interests;

      await userRepository.save(user);

      return res.status(200).json({ message: "Profile updated successfully!", user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  // Get Current User Profile
  static async getProfile(req: Request, res: Response): Promise<any> {
    try {
      const { userId } = req.body.user; // From Middleware

      const userRepository = AppDataSource.getRepository(User);
      
      const user = await userRepository.findOne({ 
        where: { id: userId },
        // Select specific fields (security: don't send password)
        select: ["id", "name", "email", "bio", "location", "interests", "profile_image"] 
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}