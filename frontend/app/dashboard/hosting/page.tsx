"use client";

import { useState } from "react";
import Link from "next/link";
import { useHostingData } from "@/hooks/useHostingData";
import { FiMapPin, FiActivity, FiUsers } from "react-icons/fi";
import HostedTripCard from "@/components/dashboard/HostedTripCard";
import StatCard from "@/components/dashboard/StatCard";
import { JoinRequest } from "@/types/dashboard";

export default function HostingPage() {
    const { trips, loading, handleAction, handleDeleteTrip } = useHostingData();
    const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'PAST'>('ALL');

    if (loading) return <div className="text-center py-10 animate-pulse text-travel-text-muted">Loading Hosting Data...</div>;

    // Derived Stats
    const totalRequests = trips.reduce((acc, trip) => acc + (trip.joinRequests?.length || 0), 0);
    const acceptedBuddies = trips.reduce((acc, trip) => {
        return acc + (trip.joinRequests || []).filter((r: JoinRequest) => r.status === 'accepted').length;
    }, 0);
    const filteredTrips = trips.filter(trip => {
        const tripDate = new Date(trip.startDate);
        const isPast = tripDate < new Date(new Date().setHours(0, 0, 0, 0));
        if (filter === 'ALL') return true;
        return filter === 'PAST' ? isPast : !isPast;
    });

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={<FiMapPin />} value={trips.length} label="Trips Hosted" colorClass="bg-blue-100 text-blue-600" />
                <StatCard icon={<FiActivity />} value={totalRequests} label="Total Requests" colorClass="bg-orange-100 text-orange-600" />
                <StatCard icon={<FiUsers />} value={acceptedBuddies} label="Buddies Found" colorClass="bg-green-100 text-green-600" />
            </div>

            {/* Filter */}
            <div className="flex bg-travel-card border border-travel-border rounded-lg p-1 w-full md:w-auto self-start">
                {['ALL', 'UPCOMING', 'PAST'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as 'ALL' | 'UPCOMING' | 'PAST')}
                        className={`px-6 py-2 text-xs font-bold rounded-md transition-all ${filter === f ? 'bg-travel-bg text-travel-text shadow-sm border border-travel-border' : 'text-travel-text-muted hover:bg-travel-bg'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Trips List */}
            {filteredTrips.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-travel-border rounded-xl bg-travel-card">
                    <p className="text-4xl mb-4">📭</p>
                    <h3 className="text-xl font-bold text-travel-text mb-2">No {filter.toLowerCase()} trips found</h3>
                    <Link href="/trips/create" className="bg-travel-accent text-white px-6 py-2 rounded-full font-medium inline-block mt-4 hover:bg-travel-accent-hover transition">
                        Post a Trip
                    </Link>
                </div>
            ) : (
                filteredTrips.map(trip => (
                    <HostedTripCard
                        key={trip.id}
                        trip={trip}
                        onDelete={() => handleDeleteTrip(trip.id)}
                        onAction={handleAction}
                    />
                ))
            )}
        </div>
    );
}