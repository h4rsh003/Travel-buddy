"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation"; // 👈 Hook to get ID from URL
import Link from "next/link";

type TripDetails = {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  description: string;
  user: {
    name: string;
    email: string;
    bio: string;
  };
};

export default function TripDetailsPage() {
  const { id } = useParams(); // Get "5" from URL /trips/5
  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/trips/${id}`);
        setTrip(res.data);
      } catch (error) {
        console.error("Error fetching trip:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTrip();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading Trip Details...</p>;
  if (!trip) return <p className="text-center mt-10 text-red-500">Trip not found!</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Header Image Placeholder */}
        <div className="h-48 bg-blue-600 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-white tracking-wide">{trip.destination}</h1>
        </div>

        <div className="p-8">
          {/* Creator Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600">
                {trip.user.name.charAt(0)}
            </div>
            <div>
                <p className="text-gray-900 font-bold">{trip.user.name}</p>
                <p className="text-gray-500 text-sm">{trip.user.email}</p>
            </div>
          </div>

          {/* Trip Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 border-y py-6 border-gray-100">
            <div>
                <p className="text-gray-500 text-sm uppercase font-semibold">Budget</p>
                <p className="text-2xl font-bold text-green-600">₹{trip.budget.toLocaleString()}</p>
            </div>
            <div>
                <p className="text-gray-500 text-sm uppercase font-semibold">Start Date</p>
                <p className="text-lg font-medium text-gray-900">{trip.startDate}</p>
            </div>
            <div>
                <p className="text-gray-500 text-sm uppercase font-semibold">End Date</p>
                <p className="text-lg font-medium text-gray-900">{trip.endDate}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-3">About the Trip</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {trip.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
             <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                Request to Join 🚀
             </button>
             <Link href="/" className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">
                Back to Feed
             </Link>
          </div>

        </div>
      </div>
    </div>
  );
}