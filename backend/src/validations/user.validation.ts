import { z } from "zod";

export class UserValidation {
  static updateProfile = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(), // 👈 Added Name
    bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
    location: z.string().max(100).optional(),
    interests: z.array(z.string()).optional(),
  });
}