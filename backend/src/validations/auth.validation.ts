import { z } from "zod";

export class AuthValidation {
  static registerSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
    email: z.string().email({ message: "Invalid email format" }),
    password: z.string()
      .min(6, { message: "Password must be at least 6 characters" })
      .regex(/[A-Z]|[0-9]/, { message: "Password must contain at least one uppercase letter OR one number" }),
  });

  static loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, { message: "Password is required" }),
  });

}