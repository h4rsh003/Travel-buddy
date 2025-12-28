"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { FiMapPin, FiCalendar } from "react-icons/fi"; 

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
  
  // 🔍 1. Search State
  const [searchQuery, setSearchQuery] = useState("");

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

  // 🔍 2. Filter Logic (Real-time)
  const filteredTrips = trips.filter((trip) => 
    trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-travel-bg">
      
      {/* 🟢 HERO SECTION */}
      <div className="relative bg-travel-card border-b border-travel-border overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-travel-accent to-orange-500"></div>
        
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center md:text-left relative z-10">
           <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-travel-text">
             Find your next <br className="hidden md:block" />
             <span className="bg-gradient-to-r from-travel-accent to-orange-500 bg-clip-text text-transparent">
               Travel Adventure
             </span>
           </h1>
           <p className="text-lg text-travel-text-muted max-w-2xl mb-8 mx-auto md:mx-0">
             Connect with like-minded travelers, split costs, and make memories. 
             Do not travel alone—find your buddy today.
           </p>
           
           {/* 🔍 3. Functional Search Bar */}
           <div className="max-w-md mx-auto md:mx-0 bg-travel-bg p-2 rounded-full border border-travel-border flex items-center shadow-sm focus-within:ring-2 focus-within:ring-travel-accent transition-all">
              <span className="pl-4 text-xl">🔍</span>
              <input 
                type="text" 
                placeholder="Where do you want to go?" 
                value={searchQuery} // Bind value
                onChange={(e) => setSearchQuery(e.target.value)} // Update state
                className="flex-1 bg-transparent border-none focus:ring-0 text-travel-text placeholder:text-travel-text-muted px-3 py-2 outline-none w-full"
              />
              <button className="bg-travel-text text-travel-bg px-6 py-2 rounded-full font-bold hover:opacity-90 transition">
                Search
              </button>
           </div>
        </div>
        
        {/* Background Blur */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-travel-accent/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 🟢 FEED SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-8 gap-2">
            <div>
              <h2 className="text-2xl font-bold text-travel-text">Latest Trips</h2>
              <p className="text-sm text-travel-text-muted">Discover where people are going</p>
            </div>
            {filteredTrips.length > 0 && (
              <span className="text-sm bg-travel-card px-3 py-1 rounded-full border border-travel-border text-travel-text-muted">
                Showing {filteredTrips.length} results
              </span>
            )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-travel-accent mb-4"></div>
             <p className="text-travel-text-muted animate-pulse">Finding best trips...</p>
          </div>
        ) : filteredTrips.length === 0 ? (
          // Empty State (No Matches)
          <div className="text-center py-20 bg-travel-card rounded-2xl border-2 border-dashed border-travel-border">
             <p className="text-4xl mb-4">🌏</p>
             <h3 className="text-xl font-bold text-travel-text mb-2">No trips found</h3>
             <p className="text-travel-text-muted mb-6">
                {searchQuery ? `No matches for "${searchQuery}"` : "Be the pioneer and post the first journey!"}
             </p>
             <Link href="/trips/create" className="bg-travel-accent text-white px-6 py-3 rounded-full font-bold hover:bg-travel-accent-hover transition">
                Post a Trip
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 🔍 4. Map over filteredTrips instead of trips */}
            {filteredTrips.map((trip) => (
              <div key={trip.id} className="group flex flex-col bg-travel-card rounded-2xl shadow-sm border border-travel-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full">
                
                {/* Card Header */}
                <div className="h-32 bg-gradient-to-r from-travel-accent/10 to-orange-500/10 flex items-center justify-center border-b border-travel-border">
                    <h3 className="text-2xl font-bold text-travel-accent group-hover:scale-105 transition-transform duration-300">
                      {trip.destination}
                    </h3>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-1 text-travel-text-muted text-xs font-medium bg-travel-bg px-2 py-1 rounded-md border border-travel-border">
                      <FiCalendar />
                      {trip.startDate}
                    </div>
                    <div className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                      ₹{trip.budget.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 mb-4">
                    <FiMapPin className="text-travel-accent mt-1 shrink-0" />
                    <h3 className="text-lg font-bold text-travel-text leading-tight group-hover:text-travel-accent transition-colors">
                      Trip to {trip.destination}
                    </h3>
                  </div>

                  <p className="text-travel-text-muted text-sm line-clamp-2 leading-relaxed mb-6 flex-1">
                    {trip.description}
                  </p>

                  {/* Card Footer */}
                  <div className="pt-4 border-t border-travel-border flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-travel-accent to-orange-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                        {trip.user.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-travel-text-muted">Hosted by</span>
                        <span className="text-xs font-bold text-travel-text">
                          {trip.user.name.split(" ")[0]}
                        </span>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/trips/${trip.id}`} 
                      className="text-sm font-bold text-travel-accent hover:text-orange-600 transition-colors flex items-center gap-1 group/link"
                    >
                      View <span className="group-hover/link:translate-x-1 transition-transform">→</span>
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