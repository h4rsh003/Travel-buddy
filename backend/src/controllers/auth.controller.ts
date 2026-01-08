import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { AuthValidation } from "../validations/auth.validation";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail";

export class AuthController {

  // 1. REGISTER: Generate OTP & Token (DO NOT SAVE TO DB)
  static async register(req: Request, res: Response): Promise<any> {
    try {
      const { name, email, password } = req.body;
      const validation = AuthValidation.registerSchema.safeParse({ name, email, password });

      if (!validation.success) {
        return res.status(400).json({
          message: "Validation Error",
          errors: validation.error.format()
        });
      }

      const userRepository = AppDataSource.getRepository(User);
      const existingUser = await userRepository.findOne({ where: { email } });

      if (existingUser) {
        return res.status(409).json({ message: "Email already exists. Please login." });
      }

      // Hash password immediately
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Generate OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      // Send Email
      await sendEmail(email, otp);

      // Create a temporary JWT containing the signup data
      // We DO NOT save to DB yet. We hand this data to the client securely.
      const registrationToken = jwt.sign(
        { name, email, password: hashedPassword, otp },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "10m" } // Token valid for 10 mins
      );

      return res.status(200).json({
        message: "OTP sent! Check your email.",
        registrationToken // Send this to frontend
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // 2. VERIFY OTP: Verify Token -> Save User to DB
  static async verifyOtp(req: Request, res: Response): Promise<any> {
    try {
      const { otp, registrationToken } = req.body; 

      if (!registrationToken) {
        return res.status(400).json({ message: "Missing registration token" });
      }

      let decoded: any;
      try {
        decoded = jwt.verify(registrationToken, process.env.JWT_SECRET || "secret");
      } catch (err) {
        return res.status(400).json({ message: "Session expired. Please register again." });
      }

      // Check OTP
      if (decoded.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      const userRepository = AppDataSource.getRepository(User);
      
      // Double check if user wasn't created in the meantime
      const existingUser = await userRepository.findOne({ where: { email: decoded.email } });
      if (existingUser) {
          return res.status(409).json({ message: "User already registered." });
      }

      const user = new User();
      user.name = decoded.name;
      user.email = decoded.email;
      user.password = decoded.password;
      user.isVerified = true;

      await userRepository.save(user);

      return res.status(201).json({ message: "Account verified & created! Please login." });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // 3. LOGIN
  static async login(req: Request, res: Response): Promise<any> {
    try {
      const { email, password } = req.body;
      const validation = AuthValidation.loginSchema.safeParse({ email, password });

      if (!validation.success) {
        return res.status(400).json({
          message: "Validation Error",
          errors: validation.error.format()
        });
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { email } });

      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (user.isVerified === false) {
        return res.status(401).json({ message: "Please verify your email before logging in." });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" }
      );

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
}