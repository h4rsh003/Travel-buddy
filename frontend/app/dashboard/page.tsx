"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

// 1. Define Types
type JoinRequest = {
  id: number;
  status: "pending" | "accepted" | "rejected";
  user: {
    id: number;
    name: string;
    email: string;
  };
};

type Trip = {
  id: number;
  destination: string;
  startDate: string;
  joinRequests: JoinRequest[];
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]); 
  const [loading, setLoading] = useState(true);

  // 2. Fetch Logic
  const fetchMyTrips = useCallback(async () => {
    if (!session?.user) return;
    try {
      // @ts-expect-error -- Access token is not yet typed in NextAuth
      let token = session.user.accessToken;
      if (typeof token === "string") token = token.replace(/"/g, "");

      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/trips/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrips(res.data);
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Fetch My Trips
  useEffect(() => {
    if (status === "unauthenticated") {
        router.push("/auth/login");
    } else if (session?.user) {
        fetchMyTrips();
    }
  }, [status, session, router, fetchMyTrips]); 

  // Handle Accept/Reject
  const handleAction = async (requestId: number, action: "accepted" | "rejected") => {
    try {
      // @ts-expect-error -- Access token is not yet typed in NextAuth
      let token = session.user.accessToken;
      if (typeof token === "string") token = token.replace(/"/g, "");

      await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/requests/${requestId}/${action}`, {}, {
         headers: { Authorization: `Bearer ${token}` }
      });

      alert(`Request ${action}!`);
      fetchMyTrips(); // Refresh UI
    } catch (error) {
      console.error(error); 
      alert("Action failed");
    }
  };

  if (loading) return <p className="text-center mt-10 text-travel-text-muted">Loading Dashboard...</p>;

  return (
    <div className="min-h-screen bg-travel-bg py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-travel-text mb-8">My Dashboard 📊</h1>

        {trips.length === 0 ? (
           <div className="text-center py-10 border-2 border-dashed border-travel-border rounded-lg">
             <p className="text-travel-text-muted">You have not posted any trips yet.</p>
           </div>
        ) : (
           <div className="space-y-6">
             {trips.map((trip) => (
               // 🎨 Updated Card Styling
               <div key={trip.id} className="bg-travel-card p-6 rounded-lg shadow-sm border border-travel-border">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-travel-text">{trip.destination}</h3>
                    <span className="text-sm text-travel-text-muted">{trip.startDate}</span>
                 </div>
                 
                 {/* Requests Section */}
                 <div className="bg-travel-bg p-4 rounded-md border border-travel-border">
                    <h4 className="font-semibold text-travel-text mb-3 text-sm uppercase tracking-wide">
                        Join Requests ({trip.joinRequests.length})
                    </h4>
                    
                    {trip.joinRequests.length === 0 ? (
                        <p className="text-sm text-travel-text-muted italic">No requests yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {trip.joinRequests.map((req) => (
                                <div key={req.id} className="flex justify-between items-center bg-travel-card p-3 rounded border border-travel-border">
                                    <div className="flex items-center gap-3">
                                        {/* Avatar */}
                                        <div className="h-8 w-8 bg-travel-bg border border-travel-border rounded-full flex items-center justify-center text-xs font-bold text-travel-text">
                                            {req.user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-travel-text">{req.user.name}</p>
                                            <p className="text-xs text-travel-text-muted">{req.user.email}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        {req.status === "pending" ? (
                                            <>
                                                <button 
                                                    onClick={() => handleAction(req.id, "accepted")}
                                                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors shadow-sm"
                                                >
                                                    Accept
                                                </button>
                                                <button 
                                                    onClick={() => handleAction(req.id, "rejected")}
                                                    className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors shadow-sm"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={`text-xs font-bold px-2 py-1 rounded border ${
                                                    req.status === "accepted" 
                                                    ? "bg-green-50 text-green-700 border-green-200" 
                                                    : "bg-red-50 text-red-700 border-red-200"
                                                }`}>
                                                    {req.status.toUpperCase()}
                                                </span>
                                                
                                                {/* Contact Reveal */}
                                                {req.status === "accepted" && (
                                                    <a href={`mailto:${req.user.email}`} className="text-xs text-travel-accent hover:text-travel-accent-hover underline">
                                                        {req.user.email}
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                 </div>
               </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
}