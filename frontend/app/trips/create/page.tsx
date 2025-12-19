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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/trips`, // ✅ CORRECT: Using variable
        {
          ...data,
          budget: Number(data.budget),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Trip Created Successfully! ✈️");
      router.push("/"); // Redirect to Home (Feed)
    } catch (error) {
      console.error(error);
      alert("Failed to create trip.");
    }
  };

  if (status === "loading") return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl p-8">
        <h2 className="text-3xl font-bold text-blue-600 mb-6 text-center">Plan a New Trip 🌍</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Destination</label>
            <input
              {...register("destination", { required: true })}
              type="text"
              placeholder="e.g. Goa, Paris, Manali"
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Dates Row */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                {...register("startDate", { required: true })}
                type="date"
                className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                {...register("endDate", { required: true })}
                type="date"
                className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Estimated Budget (₹)</label>
            <input
              {...register("budget", {
                required: true,
                pattern: /^[0-9]+$/,
              })}
              type="text"
              inputMode="numeric"
              placeholder="15000"
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Trip Description</label>
            <textarea
              {...register("description", { required: true })}
              rows={4}
              placeholder="What's the plan? Chilling, Trekking, Sightseeing?"
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center rounded-md bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
          >
            {isSubmitting ? "Posting..." : "Post Trip 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}