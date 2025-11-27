import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { AuthValidation } from "../validations/auth.validation";

export class AuthController {
  static async register(req: Request, res: Response): Promise<any> {
    try {
      // 1. Validate incoming data
      const { name, email, password } = req.body;
      const validation = AuthValidation.registerSchema.safeParse({ name, email, password });

      if (!validation.success) {
        return res.status(400).json({ 
            message: "Validation Error", 
            errors: validation.error.format() 
        });
      }

      // 2. Check if user already exists
      const userRepository = AppDataSource.getRepository(User);
      const existingUser = await userRepository.findOne({ where: { email } });

      if (existingUser) {
        return res.status(409).json({ message: "Email already exists" });
      }

      // 3. Hash the password (Security)
      const hashedPassword = await bcrypt.hash(password, 10);

      // 4. Save to Database
      const user = new User();
      user.name = name;
      user.email = email;
      user.password = hashedPassword;

      await userRepository.save(user);

      // 5. Return success (exclude password from response)
      return res.status(201).json({ 
        message: "User registered successfully!", 
        user: { id: user.id, name: user.name, email: user.email } 
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}