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
    id: number;
    name: string;
    email: string;
    bio?: string;
  };
};

export default function TripDetailsPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  
  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State for button loading
  const [requesting, setRequesting] = useState(false);
  // State to track if request was sent successfully
  const [hasRequested, setHasRequested] = useState(false);

  // Fetch Trip Data
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

  // Handle Join Request
  const handleJoinRequest = async () => {
    if (!session) {
      alert("Please login to join this trip!");
      router.push("/auth/login");
      return;
    }

    try {
      setRequesting(true);

      // @ts-expect-error -- Access token not typed in NextAuth
      let token = session.user.accessToken;
      if (typeof token === "string") {
        token = token.replace(/"/g, ""); 
      }

      await axios.post("http://localhost:5000/api/requests/send", 
        { tripId: Number(id) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ SUCCESS! Update UI
      setHasRequested(true); 

    } catch (error) {
      console.error(error);
      
      // 🛠️ FIX: Use axios.isAxiosError instead of 'any'
      if (axios.isAxiosError(error) && error.response) {
         if (error.response.status === 409) {
            setHasRequested(true);
            alert("You have already requested to join this trip.");
         } else {
            alert(error.response.data.message);
         }
      } else {
         alert("Failed to send request.");
      }
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg animate-pulse">Loading Trip Details...</p>
    </div>
  );

  if (!trip) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 text-xl font-bold">Trip not found!</p>
        <Link href="/" className="text-blue-600 hover:underline">Go Back Home</Link>
    </div>
  );

  // Check if current user is the owner
  // @ts-expect-error -- session user id typing
  const isOwner = session?.user?.id === trip.user.id;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        
        {/* Header Image - 🛠️ FIX: Updated to bg-linear-to-r for Tailwind v4 */}
        <div className="h-56 bg-linear-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wide shadow-sm">
                {trip.destination}
            </h1>
        </div>

        <div className="p-8">
          {/* Creator Info */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-14 w-14 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-xl font-bold text-gray-600">
                {trip.user.name.charAt(0)}
            </div>
            <div>
                <p className="text-gray-900 font-bold text-lg">{trip.user.name}</p>
                <p className="text-gray-500 text-sm">Trip Organizer</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 border-y border-gray-100 py-6 bg-gray-50/50 rounded-lg px-4">
            <div>
                <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Budget</p>
                <p className="text-2xl font-bold text-green-600">₹{trip.budget.toLocaleString()}</p>
            </div>
            <div>
                <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Start Date</p>
                <p className="text-lg font-medium text-gray-900">{trip.startDate}</p>
            </div>
            <div>
                <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">End Date</p>
                <p className="text-lg font-medium text-gray-900">{trip.endDate}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-gray-800 mb-4">About the Trip</h3>
            <div className="prose prose-blue text-gray-600 leading-relaxed whitespace-pre-wrap">
                {trip.description}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
             {isOwner ? (
                // 🔴 Case 1: Owner
                <button disabled className="flex-1 bg-gray-100 text-gray-400 py-3 rounded-lg font-bold cursor-not-allowed border border-gray-200">
                    You Own This Trip
                </button>
             ) : hasRequested ? (
                // 🟢 Case 2: Already Requested (Success State)
                <button disabled className="flex-1 bg-green-100 text-green-700 border border-green-200 py-3 rounded-lg font-bold cursor-not-allowed">
                    Request Sent ✅
                </button>
             ) : (
                // 🔵 Case 3: Can Join
                <button 
                    onClick={handleJoinRequest}
                    disabled={requesting}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-blue-300 shadow-md hover:shadow-lg transform active:scale-95 duration-200"
                >
                    {requesting ? "Sending..." : "Request to Join 🚀"}
                </button>
             )}
             
             <Link 
                href="/" 
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 text-center transition"
             >
                Back to Feed
             </Link>
          </div>

        </div>
      </div>
    </div>
  );
}