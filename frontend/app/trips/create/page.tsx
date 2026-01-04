"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { useEffect } from "react";
import toast from "react-hot-toast";

type TripFormValues = {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  description: string;
};

export default function CreateTripPage() {
  const { status } = useSession();
  const router = useRouter();
  const axiosAuth = useAxiosAuth();
  const today = new Date().toISOString().split("T")[0];

  const { register, handleSubmit, control, formState: { errors, isSubmitting, isValid } } =
    useForm<TripFormValues>({
      mode: "onChange"
    });

  const startDate = useWatch({
    control,
    name: "startDate",
  });


  // Protect Route
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const onSubmit = async (data: TripFormValues) => {
    try {
      await axiosAuth.post("/api/trips", {
        ...data,
        budget: Number(data.budget),
      });

      toast.success("Trip Created Successfully!");
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create trip.");
    }
  };

  if (status === "loading") return <p className="text-center mt-10 text-travel-text-muted">Loading...</p>;

  return (
    <div className="min-h-screen bg-travel-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-travel-card rounded-xl shadow-lg border border-travel-border overflow-hidden md:max-w-2xl p-8">
        <h2 className="text-3xl font-bold text-travel-text mb-6 text-center">Plan a New Trip</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-travel-text">Destination</label>
            <input
              {...register("destination", { required: "Destination is required" })}
              type="text"
              placeholder="e.g. Goa, Paris, Manali"
              className={`mt-1 block w-full rounded-md border px-3 py-2 text-travel-text placeholder-travel-text-muted focus:outline-none focus:ring-1 sm:text-sm bg-travel-bg transition-colors ${errors.destination
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-travel-border focus:border-travel-accent focus:ring-travel-accent"
                }`}
            />
            {errors.destination && <p className="mt-1 text-xs text-red-500 animate-pulse">{errors.destination.message}</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-travel-text">Start Date</label>
              <input
                {...register("startDate", { required: "Start date is required" })}
                type="date"
                min={today}
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-travel-text focus:outline-none focus:ring-1 sm:text-sm bg-travel-bg transition-colors ${errors.startDate
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-travel-border focus:border-travel-accent focus:ring-travel-accent"
                  }`}
              />
              {errors.startDate && <p className="mt-1 text-xs text-red-500 animate-pulse">{errors.startDate.message}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-travel-text">End Date</label>
              <input
                {...register("endDate", { required: "End date is required" })}
                type="date"
                min={startDate || today}
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-travel-text focus:outline-none focus:ring-1 sm:text-sm bg-travel-bg transition-colors ${errors.endDate
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-travel-border focus:border-travel-accent focus:ring-travel-accent"
                  }`}
              />
              {errors.endDate && <p className="mt-1 text-xs text-red-500 animate-pulse">{errors.endDate.message}</p>}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-travel-text">Estimated Budget (₹)</label>
            <input
              {...register("budget", {
                required: "Budget is required",
                pattern: {
                  value: /^[0-9]+$/,
                  message: "Please use only numeric values (0-9)"
                }
              })}
              type="text"
              inputMode="numeric"
              placeholder="15000"
              className={`mt-1 block w-full rounded-md border px-3 py-2 text-travel-text placeholder-travel-text-muted focus:outline-none focus:ring-1 sm:text-sm bg-travel-bg transition-colors ${errors.budget
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-travel-border focus:border-travel-accent focus:ring-travel-accent"
                }`}
            />
            {errors.budget && (
              <p className="mt-1 text-xs text-red-500 font-medium animate-pulse">
                {errors.budget.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-travel-text">Trip Description</label>
            <textarea
              {...register("description", {
                required: "Description is required",
                minLength: {
                  value: 10,
                  message: "Description must be at least 10 characters"
                }
              })}
              rows={4}
              placeholder="What's the plan? Chilling, Trekking, Sightseeing?"
              className={`mt-1 block w-full rounded-md border px-3 py-2 text-travel-text placeholder-travel-text-muted focus:outline-none focus:ring-1 sm:text-sm bg-travel-bg transition-colors ${errors.description
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-travel-border focus:border-travel-accent focus:ring-travel-accent"
                }`}
            />
            {errors.description && <p className="mt-1 text-xs text-red-500 animate-pulse">{errors.description.message}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full flex justify-center rounded-md bg-travel-accent px-4 py-3 text-sm font-bold cursor-pointer text-white shadow-sm hover:bg-travel-accent-hover focus:outline-none focus:ring-2 focus:ring-travel-accent focus:ring-offset-2 disabled:bg-travel-border disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          >
            {isSubmitting ? "Posting..." : "Post Trip"}
          </button>
        </form>
      </div>
    </div>
  );
}