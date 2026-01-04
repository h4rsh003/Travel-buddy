"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { FiCalendar, FiTrash2, FiUsers, FiMapPin, FiActivity, FiChevronDown, FiCheck, FiX, FiMail } from "react-icons/fi";

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

            {/* Header & Stats (From Your Original Layout) */}
            <div className="mb-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h1 className="text-3xl font-bold text-travel-text">My Dashboard</h1>
                    {/* Filter Tabs */}
                    <div className="flex bg-travel-card border border-travel-border rounded-lg p-1 w-full md:w-auto">
                        {['ALL', 'UPCOMING', 'PAST'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as 'ALL' | 'UPCOMING' | 'PAST')}
                                className={`flex-1 md:flex-none px-6 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                    filter === f
                                    ? 'bg-travel-accent text-white shadow-sm'
                                    : 'text-travel-text-muted hover:bg-travel-bg hover:text-travel-text'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-travel-card p-5 rounded-xl border border-travel-border shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
                        <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl"><FiMapPin /></div>
                        <div>
                            <p className="text-2xl font-bold text-travel-text">{trips.length}</p>
                            <p className="text-xs text-travel-text-muted uppercase font-semibold">Trips Hosted</p>
                        </div>
                    </div>
                    <div className="bg-travel-card p-5 rounded-xl border border-travel-border shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
                        <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xl"><FiActivity /></div>
                        <div>
                            <p className="text-2xl font-bold text-travel-text">{totalRequests}</p>
                            <p className="text-xs text-travel-text-muted uppercase font-semibold">Total Requests</p>
                        </div>
                    </div>
                    <div className="bg-travel-card p-5 rounded-xl border border-travel-border shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
                        <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl"><FiUsers /></div>
                        <div>
                            <p className="text-2xl font-bold text-travel-text">{acceptedBuddies}</p>
                            <p className="text-xs text-travel-text-muted uppercase font-semibold">Buddies Found</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trips List (Modified to Split View) */}
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

                                {/* Card Flex Container */}
                                <div className="flex flex-col md:flex-row">
                                    {/* Left: Destination, Date & Actions */}
                                    <div className="flex-1 p-6 flex flex-col justify-center border-r-0 md:border-r border-travel-border">
                                        <div className="flex flex-col gap-1 mb-4">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-2xl font-bold text-travel-text">{trip.destination}</h3>
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-travel-text-muted">
                                                <FiCalendar className="text-travel-accent" />
                                                <span>{formatDate(trip.startDate)} — {formatDate(trip.endDate)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {/* View Details Text Button */}
                                            <Link 
                                                href={`/trips/${trip.id}`} 
                                                className="px-4 py-2 bg-travel-accent/10 hover:bg-travel-accent/20 text-travel-accent text-xs font-bold uppercase tracking-wide rounded-lg transition-colors cursor-pointer"
                                            >
                                                View Details
                                            </Link>
                                            
                                            <button
                                                onClick={() => handleDeleteTrip(trip.id)}
                                                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                title="Delete Trip"
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Right: Requests Toggle (Desktop Sidebar) */}
                                    <button
                                        onClick={() => setExpandedTripId(isExpanded ? null : trip.id)}
                                        className={`w-full md:w-64 border-t md:border-t-0 p-6 flex md:flex-col items-center justify-between md:justify-center gap-3 hover:bg-travel-bg/50 transition cursor-pointer text-left md:text-center group ${
                                            isExpanded ? "bg-travel-bg/50" : ""
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 md:flex-col md:gap-2">
                                            <div className={`p-2 rounded-full transition-colors ${trip.joinRequests.length > 0 ? "bg-travel-accent text-white" : "bg-gray-100 text-gray-400"}`}>
                                                <FiUsers size={20} />
                                            </div>
                                            <div className="flex flex-col md:items-center">
                                                <span className="font-bold text-travel-text text-sm">Join Requests</span>
                                                <span className={`text-xs font-medium ${trip.joinRequests.length > 0 ? "text-travel-accent" : "text-travel-text-muted"}`}>
                                                    {trip.joinRequests.length} Pending
                                                </span>
                                            </div>
                                        </div>
                                        {/* Rotating Chevron */}
                                        <div className={`text-travel-text-muted transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                                            <FiChevronDown size={20} />
                                        </div>
                                    </button>
                                </div>

                                {/* Expanded Requests List */}
                                {isExpanded && (
                                    <div className="border-t border-travel-border bg-travel-bg/30 p-6 animate-fade-in">
                                        {trip.joinRequests.length === 0 ? (
                                            <div className="text-center py-4 text-travel-text-muted italic flex flex-col items-center gap-2">
                                                <FiMail size={20} className="opacity-50" />
                                                No pending requests yet.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {trip.joinRequests.map((req) => (
                                                    <div key={req.id} className="flex justify-between items-center bg-travel-card p-4 rounded-xl border border-travel-border shadow-sm">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="h-10 w-10 bg-linear-to-br from-gray-100 to-gray-200 text-gray-700 rounded-full flex items-center justify-center text-sm font-bold border border-travel-border shrink-0">
                                                                {req.user.name.charAt(0)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold text-travel-text truncate">{req.user.name}</p>
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

                                                        <div className="flex items-center gap-2 shrink-0">
                                                            {req.status === "pending" ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleAction(req.id, "accepted")}
                                                                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition border border-green-200 cursor-pointer shadow-sm"
                                                                        title="Accept"
                                                                    >
                                                                        <FiCheck />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleAction(req.id, "rejected")}
                                                                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition border border-red-200 cursor-pointer shadow-sm"
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