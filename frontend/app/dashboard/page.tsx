"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

// 1. Define Types (Fixes 'no-explicit-any')
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
    const [trips, setTrips] = useState<Trip[]>([]); // 👈 Typed correctly
    const [loading, setLoading] = useState(true);

    // 2. Wrap function in useCallback (Fixes 'exhaustive-deps')
    const fetchMyTrips = useCallback(async () => {
        if (!session?.user) return;
        try {
            // @ts-expect-error -- Access token is not yet typed in NextAuth
            let token = session.user.accessToken;
            if (typeof token === "string") token = token.replace(/"/g, "");

            const res = await axios.get("process.env.NEXT_PUBLIC_BACKEND_URL/api/trips/user/me", {
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
    }, [status, session, router, fetchMyTrips]); // 👈 Added all dependencies

    // Handle Accept/Reject
    const handleAction = async (requestId: number, action: "accepted" | "rejected") => {
        try {
            // @ts-expect-error -- Access token is not yet typed in NextAuth
            let token = session.user.accessToken;
            if (typeof token === "string") token = token.replace(/"/g, "");

            await axios.patch(`process.env.NEXT_PUBLIC_BACKEND_URL/api/requests/${requestId}/${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(`Request ${action}!`);
            fetchMyTrips(); // Refresh UI
        } catch (error) {
            console.error(error); // 👈 Log error to fix 'no-unused-vars'
            alert("Action failed");
        }
    };

    if (loading) return <p className="text-center mt-10">Loading Dashboard...</p>;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Dashboard 📊</h1>

                {trips.length === 0 ? (
                    <p>You have not posted any trips yet.</p>
                ) : (
                    <div className="space-y-6">
                        {trips.map((trip) => (
                            <div key={trip.id} className="bg-white p-6 rounded-lg shadow-sm border">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-blue-600">{trip.destination}</h3>
                                    <span className="text-sm text-gray-500">{trip.startDate}</span>
                                </div>

                                {/* Requests Section */}
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase">
                                        Join Requests ({trip.joinRequests.length})
                                    </h4>

                                    {trip.joinRequests.length === 0 ? (
                                        <p className="text-sm text-gray-500">No requests yet.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {/* 3. Typed 'req' correctly here automatically via Trip type */}
                                            {trip.joinRequests.map((req) => (
                                                <div key={req.id} className="flex justify-between items-center bg-white p-3 rounded border">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">
                                                            {req.user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold">{req.user.name}</p>
                                                            <p className="text-xs text-gray-500">{req.user.email}</p>
                                                        </div>
                                                    </div>

                                                    {/* Inside the trip.joinRequests.map loop... */}

                                                    <div className="flex items-center gap-2">
                                                        {req.status === "pending" ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleAction(req.id, "accepted")}
                                                                    className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAction(req.id, "rejected")}
                                                                    className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <div className="flex flex-col items-end gap-1">
                                                                <span className={`text-xs font-bold px-2 py-1 rounded ${req.status === "accepted" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                                    }`}>
                                                                    {req.status.toUpperCase()}
                                                                </span>

                                                                {/* 🟢 NEW: Reveal Email if Accepted */}
                                                                {req.status === "accepted" && (
                                                                    <a href={`mailto:${req.user.email}`} className="text-xs text-blue-600 underline hover:text-blue-800">
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