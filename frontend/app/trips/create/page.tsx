"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useEffect } from "react";

type TripFormValues = {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  description: string;
};

export default function CreateTripPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<TripFormValues>();

  // Protect Route
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const onSubmit = async (data: TripFormValues) => {
    if (!session?.user) return;

    try {
      // @ts-expect-error -- Access token not typed yet
      let token = session.user.accessToken;
      
      // Cleanup token
      if (typeof token === "string") token = token.replace(/"/g, "");

      // Send data to Backend
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/trips`, 
        {
          ...data,
          budget: Number(data.budget),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Trip Created Successfully!");
      router.push("/"); // Redirect to Home (Feed)
    } catch (error) {
      console.error(error);
      alert("Failed to create trip.");
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
              {...register("destination", { required: true })}
              type="text"
              placeholder="e.g. Goa, Paris, Manali"
              className="mt-1 block w-full rounded-md border border-travel-border px-3 py-2 text-travel-text placeholder-travel-text-muted focus:border-travel-accent focus:outline-none focus:ring-1 focus:ring-travel-accent sm:text-sm bg-white transition-colors"
            />
          </div>

          {/* Dates Row */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-travel-text">Start Date</label>
              <input
                {...register("startDate", { required: true })}
                type="date"
                className="mt-1 block w-full rounded-md border border-travel-border px-3 py-2 text-travel-text focus:border-travel-accent focus:outline-none focus:ring-1 focus:ring-travel-accent sm:text-sm bg-white transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-travel-text">End Date</label>
              <input
                {...register("endDate", { required: true })}
                type="date"
                className="mt-1 block w-full rounded-md border border-travel-border px-3 py-2 text-travel-text focus:border-travel-accent focus:outline-none focus:ring-1 focus:ring-travel-accent sm:text-sm bg-white transition-colors"
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-travel-text">Estimated Budget (₹)</label>
            <input
              {...register("budget", { 
                required: true,
                pattern: /^[0-9]+$/,
              })}
              type="text"
              inputMode="numeric"
              placeholder="15000"
              className="mt-1 block w-full rounded-md border border-travel-border px-3 py-2 text-travel-text placeholder-travel-text-muted focus:border-travel-accent focus:outline-none focus:ring-1 focus:ring-travel-accent sm:text-sm bg-white transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-travel-text">Trip Description</label>
            <textarea
              {...register("description", { required: true })}
              rows={4}
              placeholder="What's the plan? Chilling, Trekking, Sightseeing?"
              className="mt-1 block w-full rounded-md border border-travel-border px-3 py-2 text-travel-text placeholder-travel-text-muted focus:border-travel-accent focus:outline-none focus:ring-1 focus:ring-travel-accent sm:text-sm bg-white transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center rounded-md bg-travel-accent px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-travel-accent-hover focus:outline-none focus:ring-2 focus:ring-travel-accent focus:ring-offset-2 disabled:bg-travel-border disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Posting..." : "Post Trip"}
          </button>
        </form>
      </div>
    </div>
  );
}