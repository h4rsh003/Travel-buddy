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
    <main className="min-h-screen bg-travel-bg">
      
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        
        {/* Simple Banner */}
        <div className="mb-8 text-center md:text-left">
           {/* Update: Use travel-text instead of gray-900 */}
           <h1 className="text-3xl font-bold text-travel-text">Explore Trips 🌍</h1>
           {/* Update: Use travel-text-muted instead of gray-500 */}
           <p className="text-travel-text-muted mt-2">Find companions for your next adventure.</p>
        </div>

        {loading ? (
          <p className="text-center text-travel-text-muted">Loading trips...</p>
        ) : trips.length === 0 ? (
          <div className="text-center py-20">
             <p className="text-xl text-travel-text-muted">No trips posted yet.</p>
             <p className="text-travel-accent font-medium">Be the first to post!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <div key={trip.id} className="bg-travel-card rounded-xl shadow-sm border border-travel-border hover:shadow-md transition overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      {/* Title: Should be prominent (travel-text) */}
                      <h3 className="text-xl font-bold text-travel-text">{trip.destination}</h3>
                      {/* Meta info: Use Accent color for budget/dates to pop */}
                      <p className="text-sm text-travel-accent-hover font-medium mt-1">
                        ₹{trip.budget.toLocaleString()} • {trip.startDate}
                      </p>
                    </div>
                  </div>
                  
                  {/* Description: Use muted text for better hierarchy */}
                  <p className="mt-4 text-travel-text-muted text-sm line-clamp-1">
                    {trip.description}
                  </p>

                  <div className="mt-6 pt-4 border-t border-travel-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Avatar: Use bg-travel-bg to contrast with the card */}
                      <div className="h-8 w-8 rounded-full bg-travel-bg border border-travel-border flex items-center justify-center text-travel-text font-bold text-xs">
                        {trip.user.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-travel-text">
                        {trip.user.name}
                      </span>
                    </div>
                    
                    <Link 
                      href={`/trips/${trip.id}`} 
                      className="text-sm font-medium text-travel-accent hover:text-travel-accent-hover transition-colors"
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