"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import toast from "react-hot-toast";
import { FiActivity, FiClock, FiTrash2 } from "react-icons/fi";

type TripDetails = {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  description: string;
  user: {
    id: number;
    name: string;
    email: string;
    bio?: string;
  };
  joinRequests: {
    userId: number;
    status: "pending" | "accepted" | "rejected";
  }[];
};

export default function TripDetailsPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const axiosAuth = useAxiosAuth();

  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const [requesting, setRequesting] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };


  // Fetch Trip Data (Public - uses standard axios)
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/trips/${id}`);
        setTrip(res.data);
      } catch (error) {
        console.error("Error fetching trip:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTrip();
  }, [id]);

  // Check status on load
  useEffect(() => {
    if (trip && session?.user) {
      const myId = session.user.id;

      const myRequest = trip.joinRequests?.find((req) => req.userId === Number(myId));

      if (myRequest) {
        setHasRequested(true);
        if (myRequest.status === "accepted") {
          setIsAccepted(true);
        }
      } else {
        setHasRequested(false);
      }
    }
  }, [trip, session]);

  // 1. Handle Join Request
  const handleJoinRequest = async () => {
    if (!session) {
      toast.error("Please login to join this trip!");
      router.push("/auth/login");
      return;
    }

    try {
      setRequesting(true);
      await axiosAuth.post("/api/requests/send", { tripId: Number(id) });
      setHasRequested(true);
      toast.success("Request Sent Successfully.");
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 409) {
          setHasRequested(true);
          toast.error("You have already requested to join this trip.");
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error("Failed to send request.");
      }
    } finally {
      setRequesting(false);
    }
  };

  // 2. Handle Cancel Request
  const handleCancelRequest = async () => {
    if (!confirm("Are you sure you want to withdraw your request?")) return;

    try {
      setRequesting(true);
      await axiosAuth.delete(`/api/requests/${id}`);

      setHasRequested(false);
      setIsAccepted(false);
      toast.success("Request Cancelled.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to cancel request.");
    } finally {
      setRequesting(false);
    }
  };

  // 3. Handle Delete Trip
  const handleDeleteTrip = async () => {
    if (!confirm("Are you sure you want to delete this trip? This cannot be undone.")) return;

    try {
      await axiosAuth.delete(`/api/trips/${id}`);

      toast.success("Trip Deleted Successfully.");
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete trip.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-travel-bg">
      <p className="text-travel-text-muted text-lg animate-pulse">Loading Trip Details...</p>
    </div>
  );

  if (!trip) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-travel-bg">
      <p className="text-red-500 text-xl font-bold">Trip not found!</p>
      <Link href="/" className="text-travel-accent hover:underline">Go Back Home</Link>
    </div>
  );

  const isOwner = Number(session?.user?.id) === trip.user.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tripStartDate = new Date(trip.startDate);
  tripStartDate.setHours(0, 0, 0, 0);

  const tripEndDate = new Date(trip.endDate);
  tripEndDate.setHours(0, 0, 0, 0);

  const isTripCompleted = today > tripEndDate;
  const isTripStarted = today >= tripStartDate && !isTripCompleted;


  return (
    <div className="min-h-screen bg-travel-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-travel-card rounded-xl shadow-lg overflow-hidden border border-travel-border">

        {/* Header Image - Uses travel-accent gradient */}
        <div className="h-56 bg-linear-to-r from-travel-accent to-travel-accent-hover flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wide shadow-sm">
            {trip.destination}
          </h1>
        </div>

        <div className="p-8">
          {/* Creator Info */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-14 w-14 rounded-full bg-travel-bg border-2 border-travel-card shadow-sm flex items-center justify-center text-xl font-bold text-travel-text">
              {trip.user.name.charAt(0)}
            </div>
            <div>
              <p className="text-travel-text font-bold text-lg">{trip.user.name}</p>
              {isAccepted ? (
                <div className="mt-1">
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">ACCEPTED</span>
                  <p className="text-travel-accent font-medium text-sm mt-1">
                    {trip.user.email}
                  </p>
                </div>
              ) : (
                <p className="text-travel-text-muted text-sm">Trip Organizer</p>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-y border-travel-border py-6 bg-travel-bg/50 rounded-lg px-4">
            <div>
              <p className="text-travel-text-muted text-xs uppercase font-bold tracking-wider">Budget</p>
              <p className="text-2xl font-bold text-green-600">₹{trip.budget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-travel-text-muted text-xs uppercase font-bold tracking-wider">Start Date</p>
              <p className="text-lg font-medium text-travel-text">{formatDate(trip.startDate)}</p>
            </div>
            <div>
              <p className="text-travel-text-muted text-xs uppercase font-bold tracking-wider">End Date</p>
              <p className="text-lg font-medium text-travel-text">{formatDate(trip.endDate)}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-travel-text mb-4">About the Trip</h3>
            <div className="prose prose-stone text-travel-text leading-relaxed whitespace-pre-wrap">
              {trip.description}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-travel-border">
            {isOwner ? (
              <>
                <button disabled className="flex-1 bg-travel-bg text-travel-text-muted py-3 rounded-lg font-bold cursor-not-allowed border border-travel-border">
                  You Own This Trip
                </button>

                <button onClick={handleDeleteTrip} className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 
                  border border-red-200 rounded-lg font-bold cursor-pointer hover:bg-red-100 transition">
                  Delete Trip <FiTrash2 />
                </button>
              </>
            ) : isTripCompleted ? (
              <div className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-lg font-bold text-center
                border border-gray-200 cursor-not-allowed flex items-center justify-center gap-2">
                <FiClock /> Trip Completed
              </div>
            ) : isTripStarted ? (
              <div className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-lg font-bold text-center border border-blue-100
                cursor-not-allowed flex items-center justify-center gap-2">
                <FiActivity /> Trip Started
              </div>
            ) : hasRequested ? (
              <button onClick={handleCancelRequest} disabled={requesting} className="flex-1 bg-red-50 text-red-600 border border-red-200
                py-3 cursor-pointer rounded-lg font-bold hover:bg-red-100 transition">
                {requesting ? "Cancelling..." : "Cancel Request"}
              </button>
            ) : (
              <button onClick={handleJoinRequest} disabled={requesting} className="flex-1 bg-travel-accent text-white
                py-3 rounded-lg font-bold cursor-pointer hover:bg-travel-accent-hover transition disabled:bg-travel-border shadow-md hover:shadow-lg transform active:scale-95 duration-200">
                {requesting ? "Sending..." : "Request to Join"}
              </button>
            )}

            {!isOwner && (
              <Link href="/" className="px-6 py-3 border border-travel-border rounded-lg text-travel-text
                font-medium hover:bg-travel-bg text-center transition">
                Back to Feed
              </Link>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}