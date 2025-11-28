"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

// Define TypeScript Type for a Trip
type Trip = {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  description: string;
  user: {
    name: string;
    email: string;
  };
};

export default function Home() {
  const { data: session } = useSession();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Trips on Load
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/trips");
        setTrips(res.data);
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">

      {/* 🟢 HERO SECTION (Welcome + Actions) */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Travel Buddy 2.0 ✈️</h1>
            <p className="text-gray-500 mt-1">Find your perfect travel partner.</p>
          </div>

          {session ? (
            <div className="flex gap-4 items-center">
              <span className="hidden md:block font-medium text-gray-700">
                Hi, {session.user?.name}
              </span>
              <Link href="/trips/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                + Post Trip
              </Link>
              <Link href="/profile" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Profile
              </Link>
              <button onClick={() => signOut()} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link href="/auth/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Login
              </Link>
              <Link href="/auth/register" className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 🟢 FEED SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Latest Trips 🌍</h2>

        {loading ? (
          <p>Loading trips...</p>
        ) : trips.length === 0 ? (
          <p className="text-gray-500">No trips posted yet. Be the first!</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{trip.destination}</h3>
                      <p className="text-sm text-blue-600 font-medium mt-1">
                        ₹{trip.budget.toLocaleString()} • {trip.startDate}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-gray-600 text-sm line-clamp-3">
                    {trip.description}
                  </p>

                  <div className="mt-6 pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {trip.user.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {trip.user.name}
                      </span>
                    </div>

                    <Link
                      href={`/trips/${trip.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}