"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

type TripDetails = {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  description: string;
  user: {
    id: number; // Added ID to check ownership
    name: string;
    email: string;
  };
};

export default function TripDetailsPage() {
  const { id } = useParams();
  const { data: session } = useSession(); // 👈 Get Session
  const router = useRouter();
  
  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false); // 👈 Button loading state

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

  // 👇 NEW: Handle Join Request
  const handleJoinRequest = async () => {
    if (!session) {
      alert("Please login to join this trip!");
      router.push("/auth/login");
      return;
    }

    try {
      setRequesting(true);
      // @ts-expect-error -- Access token fix
      let token = session.user.accessToken;
      if (typeof token === "string") token = token.replace(/"/g, "");

      await axios.post("http://localhost:5000/api/requests/send", 
        { tripId: Number(id) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Request Sent! 🚀 The owner will be notified.");
    } catch (error: any) {
      console.error(error);
      if (error.response) {
         alert(error.response.data.message); // e.g., "You already requested"
      } else {
         alert("Failed to send request.");
      }
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!trip) return <p className="text-center mt-10 text-red-500">Trip not found!</p>;

  // Check if current user is the owner
  // @ts-expect-error -- ID check
  const isOwner = session?.user?.id === trip.user.id;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Header */}
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

          {/* Stats */}
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

          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-3">About the Trip</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {trip.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
             {isOwner ? (
                <button disabled className="flex-1 bg-gray-300 text-gray-500 py-3 rounded-lg font-bold cursor-not-allowed">
                    You Own This Trip
                </button>
             ) : (
                <button 
                    onClick={handleJoinRequest}
                    disabled={requesting}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-blue-400"
                >
                    {requesting ? "Sending..." : "Request to Join 🚀"}
                </button>
             )}
             
             <Link href="/" className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">
                Back to Feed
             </Link>
          </div>

        </div>
      </div>
    </div>
  );
}