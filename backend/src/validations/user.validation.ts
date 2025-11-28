import { z } from "zod";

export class UserValidation {
  static updateProfile = z.object({
    bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
    location: z.string().max(100).optional(),
    interests: z.array(z.string()).optional(),
    // We will handle profile_image separately later (file upload is tricky)
  });
}