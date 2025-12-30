  "use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { toast } from "react-hot-toast"; 
import Link from "next/link"; 
import { FiCalendar, FiTrash2, FiUsers, FiMapPin, FiActivity, FiChevronDown, FiChevronUp, FiEdit2 } from "react-icons/fi";

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
  endDate: string;
  joinRequests: JoinRequest[];
};

export default function DashboardPage() {
  const {status } = useSession();
  const router = useRouter();
  const axiosAuth = useAxiosAuth(); // Initialize the hook
  
  const [trips, setTrips] = useState<Trip[]>([]); 
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'PAST'>('ALL');
  const [expandedTripId, setExpandedTripId] = useState<number | null>(null);

  // Fetch Logic
  const fetchMyTrips = useCallback(async () => {
    // Only fetch if authenticated
    if (status !== "authenticated") return;

    try {
      const res = await axiosAuth.get("/api/trips/user/me");
      setTrips(res.data);
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [status, axiosAuth]); 

  useEffect(() => {
    if (status === "unauthenticated") {
        router.push("/auth/login");
    } else if (status === "authenticated") {
        fetchMyTrips();
    }
  }, [status, router, fetchMyTrips]); 

  const handleAction = async (requestId: number, action: "accepted" | "rejected") => {
    const loadingToast = toast.loading(`Processing ${action}...`);
    try {
      //CLEANER: Just call the API
      await axiosAuth.patch(`/api/requests/${requestId}/${action}`);

      toast.dismiss(loadingToast); 
      if (action === "accepted") toast.success("Request Accepted!");
      else toast.success("Request Rejected.");
      
      fetchMyTrips(); 
    } catch (error) {
      console.error(error); 
      toast.dismiss(loadingToast);
      toast.error("Action failed.");
    }
  };

  const handleDeleteTrip = async (tripId: number) => {
    if (!confirm("Are you sure? This will delete the trip and all requests.")) return;
    const loadingToast = toast.loading("Deleting trip...");

    try {
       //CLEANER: Just call the API
       await axiosAuth.delete(`/api/trips/${tripId}`);

       toast.dismiss(loadingToast);
       toast.success("Trip Deleted Successfully.");
       fetchMyTrips(); 
    } catch (error) {
       console.error(error);
       toast.dismiss(loadingToast);
       toast.error("Failed to delete trip.");
    }
  };

  const getTripStatus = (dateString: string) => {
    const tripDate = new Date(dateString);
    const today = new Date();
    today.setHours(0,0,0,0);
    tripDate.setHours(0,0,0,0);

    if (tripDate < today) return { label: "Past", color: "bg-gray-100 text-gray-500", type: 'PAST' };
    if (tripDate.getTime() === today.getTime()) return { label: "Active Now", color: "bg-green-100 text-green-700", type: 'UPCOMING' };
    return { label: "Upcoming", color: "bg-blue-100 text-blue-700", type: 'UPCOMING' };
  };

  const filteredTrips = trips.filter(trip => {
      const status = getTripStatus(trip.startDate);
      if (filter === 'ALL') return true;
      return status.type === filter;
  });

  const totalRequests = trips.reduce((acc, trip) => acc + trip.joinRequests.length, 0);
  const acceptedBuddies = trips.reduce((acc, trip) => acc + trip.joinRequests.filter(r => r.status === 'accepted').length, 0);

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-travel-bg"><p className="text-travel-text-muted animate-pulse">Loading Dashboard...</p></div>;

  return (
    <div className="min-h-screen bg-travel-bg py-10 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Header & Stats */}
        <div className="mb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h1 className="text-3xl font-bold text-travel-text">My Dashboard</h1>
                {/* Filter Tabs */}
                <div className="flex bg-travel-card border border-travel-border rounded-lg p-1 mt-4 md:mt-0">
                    {['ALL', 'UPCOMING', 'PAST'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as 'ALL' | 'UPCOMING' | 'PAST')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                                filter === f 
                                ? 'bg-travel-accent text-white shadow-sm' 
                                : 'text-travel-text-muted cursor-pointer hover:bg-travel-bg'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-travel-card p-5 rounded-xl border border-travel-border shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl"><FiMapPin /></div>
                    <div>
                        <p className="text-2xl font-bold text-travel-text">{trips.length}</p>
                        <p className="text-xs text-travel-text-muted uppercase font-semibold">Trips Hosted</p>
                    </div>
                </div>
                <div className="bg-travel-card p-5 rounded-xl border border-travel-border shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xl"><FiActivity /></div>
                    <div>
                        <p className="text-2xl font-bold text-travel-text">{totalRequests}</p>
                        <p className="text-xs text-travel-text-muted uppercase font-semibold">Total Requests</p>
                    </div>
                </div>
                <div className="bg-travel-card p-5 rounded-xl border border-travel-border shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl"><FiUsers /></div>
                    <div>
                        <p className="text-2xl font-bold text-travel-text">{acceptedBuddies}</p>
                        <p className="text-xs text-travel-text-muted uppercase font-semibold">Buddies Found</p>
                    </div>
                </div>
            </div>
        </div>

        {filteredTrips.length === 0 ? (
           <div className="text-center py-16 border-2 border-dashed border-travel-border rounded-xl bg-travel-card">
             <p className="text-4xl mb-4">📭</p>
             <h3 className="text-xl font-bold text-travel-text mb-2">No {filter.toLowerCase()} trips found</h3>
             <p className="text-travel-text-muted mb-6">Time to plan a new adventure!</p>
             <Link href="/trips/create" className="bg-travel-accent text-white px-6 py-2 rounded-full font-medium hover:bg-travel-accent-hover transition shadow-sm">
               Post a Trip
             </Link>
           </div>
        ) : (
           <div className="space-y-6">
             {filteredTrips.map((trip) => {
               const status = getTripStatus(trip.startDate);
               const isExpanded = expandedTripId === trip.id;
               
               return (
               <div key={trip.id} className="bg-travel-card rounded-xl shadow-sm border border-travel-border overflow-hidden transition hover:shadow-md">
                 
                 {/* Card Header */}
                 <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <div>
                       <div className="flex items-center gap-3 mb-1">
                           <h3 className="text-xl font-bold text-travel-text">{trip.destination}</h3>
                           <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                               {status.label}
                           </span>
                       </div>
                       <div className="flex items-center gap-2 text-sm text-travel-text-muted">
                           <FiCalendar />
                           <span>{trip.startDate} — {trip.endDate}</span>
                       </div>
                   </div>
                   
                   <div className="flex items-center gap-3 w-full md:w-auto">
                       <Link href={`/trips/${trip.id}`} className="text-sm font-medium text-travel-accent hover:underline">
                           View Details
                       </Link>
                       
                       <div className="h-4 w-px bg-travel-border mx-1"></div>

                       {/* Edit Button (Placeholder for now) */}
                       {/* <button className="p-2 text-travel-text-muted hover:bg-travel-bg rounded-lg transition" title="Edit Trip">
                           <FiEdit2 />
                       </button> */}

                       <button 
                           onClick={() => handleDeleteTrip(trip.id)}
                           className="p-2 text-red-500 cursor-pointer hover:bg-red-50 rounded-lg transition"
                           title="Delete Trip"
                       >
                           <FiTrash2 />
                       </button>
                   </div>
                 </div>
                 
                 {/* Collapsible Requests Section */}
                 <div className="border-t border-travel-border bg-travel-bg/30">
                    <button 
                        onClick={() => setExpandedTripId(isExpanded ? null : trip.id)}
                        className="w-full cursor-pointer px-6 py-3 flex items-center justify-between text-xs font-bold text-travel-text-muted hover:bg-travel-bg/50 transition"
                    >
                        <span className="uppercase tracking-wide flex items-center gap-2">
                           <FiUsers /> Join Requests
                           {trip.joinRequests.length > 0 && (
                               <span className="bg-travel-accent text-white px-1.5 py-0.5 rounded-full text-[10px]">
                                   {trip.joinRequests.length}
                               </span>
                           )}
                        </span>
                        {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                    </button>

                    {isExpanded && (
                        <div className="p-6 pt-0 animate-fade-in">
                            {trip.joinRequests.length === 0 ? (
                                <p className="text-sm text-travel-text-muted italic text-center py-4">No pending requests yet.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                    {trip.joinRequests.map((req) => (
                                        <div key={req.id} className="flex justify-between items-center bg-travel-card p-3 rounded-lg border border-travel-border shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 bg-travel-bg border border-travel-border rounded-full flex items-center justify-center text-xs font-bold text-travel-text shrink-0">
                                                    {req.user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-travel-text">{req.user.name}</p>
                                                    {req.status !== 'pending' && (
                                                        <p className={`text-[10px] uppercase font-bold ${
                                                            req.status === 'accepted' ? 'text-green-600' : 'text-red-500'
                                                        }`}>
                                                            {req.status}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                {req.status === "pending" ? (
                                                    <>
                                                        <button 
                                                            onClick={() => handleAction(req.id, "accepted")}
                                                            className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAction(req.id, "rejected")}
                                                            className="px-3 py-1 bg-white border border-red-200 text-red-600 text-xs font-medium rounded hover:bg-red-50 transition"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                ) : (
                                                    req.status === "accepted" && (
                                                        <a href={`mailto:${req.user.email}`} className="text-xs text-travel-accent hover:underline">
                                                            Email ↗
                                                        </a>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                 </div>
               </div>
             )})}
           </div>
        )}
      </div>
    </div>
  );
}