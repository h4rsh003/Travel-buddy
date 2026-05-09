"use client";

import Link from "next/link";
import { useJoiningData } from "@/hooks/useJoiningData";
import { FiActivity, FiMapPin } from "react-icons/fi";
import StatCard from "@/components/dashboard/StatCard";
import JoinedTripCard from "@/components/dashboard/JoinedTripCard";

export default function JoiningPage() {
    const { joinedTrips, loading } = useJoiningData();

    if (loading) return <div className="text-center py-10 animate-pulse text-travel-text-muted">Loading Joined Trips...</div>;

    const pendingJoins = joinedTrips.filter(req => req.status === 'pending').length;
    const upcomingAdventures = joinedTrips.filter(req => req.status === 'accepted').length;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard icon={<FiActivity />} value={pendingJoins} label="Pending Requests" colorClass="bg-orange-100 text-orange-600" />
                <StatCard icon={<FiMapPin />} value={upcomingAdventures} label="Upcoming Adventures" colorClass="bg-green-100 text-green-600" />
            </div>

            {joinedTrips.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-travel-border rounded-xl bg-travel-card">
                    <p className="text-4xl mb-4">✈️</p>
                    <h3 className="text-xl font-bold text-travel-text mb-2">No joined trips yet</h3>
                    <Link href="/" className="bg-travel-accent text-white px-6 py-2 rounded-full font-medium inline-block mt-4 hover:bg-travel-accent-hover transition">
                        Explore Feed
                    </Link>
                </div>
            ) : (
                joinedTrips.map((request) => (
                    <JoinedTripCard key={request.id} request={request} />
                ))
            )}
        </div>
    );
}