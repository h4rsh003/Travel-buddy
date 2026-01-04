"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { FiCalendar, FiTrash2, FiUsers, FiMapPin, FiActivity, FiChevronDown, FiCheck, FiX, FiMail} from "react-icons/fi";

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
  const { status } = useSession();
  const router = useRouter();
  const axiosAuth = useAxiosAuth();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'PAST'>('ALL');
  const [expandedTripId, setExpandedTripId] = useState<number | null>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Fetch Logic
  const fetchMyTrips = useCallback(async () => {
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
    const loadingToast = toast.loading(`Processing...`);
    try {
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
    today.setHours(0, 0, 0, 0);
    tripDate.setHours(0, 0, 0, 0);

    if (tripDate < today) return { label: "Past", color: "bg-gray-100 text-gray-500", type: 'PAST' };
    if (tripDate.getTime() === today.getTime()) return { label: "Active Now", color: "bg-green-100 text-green-700 border-green-200", type: 'UPCOMING' };
    return { label: "Upcoming", color: "bg-blue-50 text-blue-700 border-blue-200", type: 'UPCOMING' };
  };

  const filteredTrips = trips.filter(trip => {
    const status = getTripStatus(trip.startDate);
    if (filter === 'ALL') return true;
    return status.type === filter;
  });

  const totalRequests = trips.reduce((acc, trip) => acc + trip.joinRequests.length, 0);
  const acceptedBuddies = trips.reduce((acc, trip) => acc + trip.joinRequests.filter(r => r.status === 'accepted').length, 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-travel-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-travel-accent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-travel-bg pb-12">
        
        {/* 1. Header Banner */}
        <div className="h-48 md:h-64 bg-linear-to-r from-travel-accent to-orange-600 relative flex items-center">
            <div className="absolute inset-0 bg-black/10"></div>
            {/* 🟢 FIX: Moved text container to be centered/padded to avoid overlap with floating cards */}
            <div className="w-full max-w-5xl mx-auto px-6 md:px-10 pb-12 relative z-10">
                <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">My Dashboard</h1>
                <p className="text-white/90 mt-2 font-medium">Manage your trips and join requests</p>
            </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
            
            {/* 2. Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-travel-card p-6 rounded-2xl shadow-lg border border-travel-border flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                    <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center text-xl shadow-sm"><FiMapPin /></div>
                    <div>
                        <p className="text-3xl font-bold text-travel-text">{trips.length}</p>
                        <p className="text-xs text-travel-text-muted uppercase font-bold tracking-wider">Trips Hosted</p>
                    </div>
                </div>
                <div className="bg-travel-card p-6 rounded-2xl shadow-lg border border-travel-border flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                    <div className="h-12 w-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center text-xl shadow-sm"><FiActivity /></div>
                    <div>
                        <p className="text-3xl font-bold text-travel-text">{totalRequests}</p>
                        <p className="text-xs text-travel-text-muted uppercase font-bold tracking-wider">Total Requests</p>
                    </div>
                </div>
                <div className="bg-travel-card p-6 rounded-2xl shadow-lg border border-travel-border flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                    <div className="h-12 w-12 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center text-xl shadow-sm"><FiUsers /></div>
                    <div>
                        <p className="text-3xl font-bold text-travel-text">{acceptedBuddies}</p>
                        <p className="text-xs text-travel-text-muted uppercase font-bold tracking-wider">Buddies Found</p>
                    </div>
                </div>
            </div>

            {/* 3. Filter Tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-travel-text hidden sm:block">Your Trips</h2>
                <div className="flex bg-travel-card p-1.5 rounded-xl border border-travel-border shadow-sm w-full sm:w-auto">
                    {['ALL', 'UPCOMING', 'PAST'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as 'ALL' | 'UPCOMING' | 'PAST')}
                            // 🟢 FIX: Added cursor-pointer
                            className={`flex-1 sm:flex-none px-6 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                                filter === f
                                ? 'bg-travel-accent text-white shadow-md'
                                : 'text-travel-text-muted hover:bg-travel-bg hover:text-travel-text'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* 4. Trips List */}
            {filteredTrips.length === 0 ? (
               <div className="text-center py-20 border-2 border-dashed border-travel-border rounded-3xl bg-travel-card">
                 <div className="text-5xl mb-4 opacity-50">📭</div>
                 <h3 className="text-xl font-bold text-travel-text mb-2">No {filter.toLowerCase()} trips found</h3>
                 <p className="text-travel-text-muted mb-6">Start planning your next adventure!</p>
                 <Link href="/trips/create" className="bg-travel-accent text-white px-8 py-3 rounded-full font-bold hover:bg-travel-accent-hover transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-block">
                   Post a Trip
                 </Link>
               </div>
            ) : (
                <div className="space-y-6">
                    {filteredTrips.map((trip) => {
                        const status = getTripStatus(trip.startDate);
                        const isExpanded = expandedTripId === trip.id;

                        return (
                            <div key={trip.id} className="bg-travel-card rounded-2xl shadow-sm border border-travel-border overflow-hidden transition hover:shadow-md">
                                
                                {/* Card Header / Body */}
                                <div className="flex flex-col md:flex-row">
                                    {/* Left: Destination & Date */}
                                    <div className="p-6 flex-1">
                                        <div className="flex flex-col gap-1 mb-4">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-2xl font-bold text-travel-text">{trip.destination}</h3>
                                                <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-travel-text-muted font-medium">
                                                <FiCalendar className="text-travel-accent" />
                                                <span>{formatDate(trip.startDate)} — {formatDate(trip.endDate)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <Link href={`/trips/${trip.id}`} className="text-sm font-bold text-travel-accent hover:underline">
                                                View Details
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteTrip(trip.id)}
                                                // 🟢 FIX: Added cursor-pointer
                                                className="text-sm font-medium text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
                                            >
                                                <FiTrash2 /> Delete
                                            </button>
                                        </div>
                                    </div>

                                    {/* Right: Requests Toggle (Desktop) */}
                                    <button
                                        onClick={() => setExpandedTripId(isExpanded ? null : trip.id)}
                                        className={`w-full md:w-64 border-t md:border-t-0 md:border-l border-travel-border p-6 flex md:flex-col items-center justify-between md:justify-center gap-2 hover:bg-travel-bg/50 transition cursor-pointer text-left md:text-center group ${
                                            isExpanded ? "bg-travel-bg/50" : ""
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`p-2 rounded-full ${trip.joinRequests.length > 0 ? "bg-travel-accent text-white" : "bg-gray-100 text-gray-400"}`}>
                                                <FiUsers size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-travel-text text-sm">Join Requests</span>
                                                <span className="text-xs text-travel-text-muted font-medium">
                                                    {trip.joinRequests.length} Pending/Active
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`text-travel-text-muted transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                                            <FiChevronDown size={20} />
                                        </div>
                                    </button>
                                </div>

                                {/* Expanded Requests Section */}
                                {isExpanded && (
                                    <div className="border-t border-travel-border bg-travel-bg/30 p-6 animate-fade-in">
                                        {trip.joinRequests.length === 0 ? (
                                            <div className="text-center py-4 text-travel-text-muted italic flex flex-col items-center gap-2">
                                                <FiMail size={24} className="opacity-50" />
                                                No pending requests yet.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {trip.joinRequests.map((req) => (
                                                    <div key={req.id} className="flex justify-between items-center bg-travel-card p-4 rounded-xl border border-travel-border shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center text-sm font-bold text-travel-text border border-travel-border">
                                                                {req.user.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-travel-text">{req.user.name}</p>
                                                                {req.status !== 'pending' ? (
                                                                    <span className={`text-[10px] uppercase font-bold ${
                                                                        req.status === 'accepted' ? 'text-green-600' : 'text-red-500'
                                                                    }`}>
                                                                        {req.status}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] uppercase font-bold text-orange-500">Pending</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Request Actions */}
                                                        <div className="flex items-center gap-2">
                                                            {req.status === "pending" ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleAction(req.id, "accepted")}
                                                                        // 🟢 FIX: Added cursor-pointer
                                                                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition border border-green-200 cursor-pointer"
                                                                        title="Accept"
                                                                    >
                                                                        <FiCheck />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleAction(req.id, "rejected")}
                                                                        // 🟢 FIX: Added cursor-pointer
                                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition border border-red-200 cursor-pointer"
                                                                        title="Reject"
                                                                    >
                                                                        <FiX />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                req.status === "accepted" && (
                                                                    <a href={`mailto:${req.user.email}`} className="text-xs font-bold text-travel-accent hover:underline flex items-center gap-1">
                                                                        <FiMail /> Contact
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
                        )
                    })}
                </div>
            )}
        </div>
    </div>
  );
}