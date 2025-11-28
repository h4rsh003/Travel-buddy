import { z } from "zod";

export class TripValidation {
  static createTrip = z.object({
    destination: z.string().min(1, "Destination is required"),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start Date must be YYYY-MM-DD"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End Date must be YYYY-MM-DD"),
    budget: z.number().min(0, "Budget cannot be negative"),
    description: z.string().min(10, "Description must be at least 10 characters"),
  });
}