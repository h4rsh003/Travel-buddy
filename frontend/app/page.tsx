"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

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
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Trips on Load
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        // ✅ FIXED: Use backticks ` ` and ${}
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/trips`);
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
      
      {/* 🟢 FEED SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        
        {/* Simple Banner */}
        <div className="mb-8 text-center md:text-left">
           <h1 className="text-3xl font-bold text-gray-900">Explore Trips 🌍</h1>
           <p className="text-gray-500 mt-2">Find companions for your next adventure.</p>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading trips...</p>
        ) : trips.length === 0 ? (
          <div className="text-center py-20">
             <p className="text-xl text-gray-500">No trips posted yet.</p>
             <p className="text-blue-500">Be the first to post!</p>
          </div>
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