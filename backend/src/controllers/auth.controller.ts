import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { AuthValidation } from "../validations/auth.validation";
import jwt from "jsonwebtoken";

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
  static async login(req: Request, res: Response): Promise<any> {
    try {
      // 1. Validate incoming data
      const { email, password } = req.body;
      const validation = AuthValidation.loginSchema.safeParse({ email, password });

      if (!validation.success) {
        return res.status(400).json({ 
            message: "Validation Error", 
            errors: validation.error.format() 
        });
      }

      // 2. Find user
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { email } });

      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // 3. Verify Password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // 4. Generate Token (The "ID Card")
      const token = jwt.sign(
        { userId: user.id, email: user.email }, 
        process.env.JWT_SECRET || "secret", 
        { expiresIn: "1h" }
      );

      // 5. Return Token
      return res.status(200).json({
        message: "Login successful!",
        token,
        user: { id: user.id, name: user.name, email: user.email }
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  static async googleLogin(req: Request, res: Response): Promise<any> {
    try {
      // 1. Validate incoming data
      const { email, name } = req.body;
      const validation = AuthValidation.googleLoginSchema.safeParse({ email, name });

      if (!validation.success) {
        return res.status(400).json({ 
            message: "Validation Error", 
            errors: validation.error.format() 
        });
      }

      // 2. Check if user exists
      const userRepository = AppDataSource.getRepository(User);
      let user = await userRepository.findOne({ where: { email } });

      // 3. If user doesn't exist, create them (Auto-Signup)
      if (!user) {
        user = new User();
        user.email = email;
        user.name = name;
        // Password remains NULL for Google users
        await userRepository.save(user);
      }

      // 4. Generate Token
      const token = jwt.sign(
        { userId: user.id, email: user.email }, 
        process.env.JWT_SECRET || "secret", 
        { expiresIn: "1h" }
      );

      // 5. Return Success
      return res.status(200).json({
        message: "Google Login successful!",
        token,
        user: { id: user.id, name: user.name, email: user.email }
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}