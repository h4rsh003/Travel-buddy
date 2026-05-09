import { useState } from "react";
import Link from "next/link";
import { FiCalendar, FiTrash2, FiUsers, FiChevronDown, FiMail, FiCheck, FiX } from "react-icons/fi";
import { Trip, JoinRequest } from "@/types/dashboard";

interface HostedTripCardProps {
    trip: Trip;
    onDelete: () => void;
    onAction: (requestId: number, action: "accepted" | "rejected") => void;
}

export default function HostedTripCard({ trip, onDelete, onAction }: HostedTripCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-travel-card rounded-xl shadow-sm border border-travel-border overflow-hidden transition hover:shadow-md mb-4">
            <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-4 md:p-6 border-b md:border-b-0 md:border-r border-travel-border">
                    <h3 className="text-xl md:text-2xl font-bold text-travel-text mb-2">
                        {typeof trip.destination === 'string' ? trip.destination : trip.destination?.name}
                    </h3>
                    <p className="text-xs md:text-sm text-travel-text-muted flex items-center gap-2 mb-4">
                        <FiCalendar className="text-travel-accent shrink-0" />
                        {new Date(trip.startDate).toLocaleDateString("en-IN")}
                    </p>
                    <div className="flex gap-3">
                        <Link href={`/trips/${trip.id}`} className="flex-1 md:flex-none text-center px-4 py-2 bg-travel-accent/10 text-travel-accent text-xs font-bold uppercase rounded-lg hover:bg-travel-accent/20 cursor-pointer transition">
                            View Details
                        </Link>
                        <button
                            onClick={onDelete}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition"
                            title="Delete Trip"
                            aria-label="Delete Trip"
                        >
                            <FiTrash2 size={18} />
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`w-full md:w-64 p-4 md:p-6 flex items-center justify-between hover:bg-travel-bg/50 cursor-pointer transition ${isExpanded ? 'bg-travel-bg/50' : ''}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${trip.joinRequests.length > 0 ? 'bg-travel-accent text-white' : 'bg-gray-100 text-gray-400'}`}>
                            <FiUsers size={20} />
                        </div>
                        <div className="text-left">
                            <span className="block font-bold text-travel-text text-sm">Join Requests</span>
                            <span className={`text-xs font-medium ${trip.joinRequests.length > 0 ? 'text-travel-accent' : 'text-travel-text-muted'}`}>
                                {trip.joinRequests.length} Pending
                            </span>
                        </div>
                    </div>
                    <FiChevronDown size={20} className={`text-travel-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {isExpanded && (
                <div className="border-t border-travel-border bg-travel-bg/30 p-4 md:p-6">
                    {trip.joinRequests.length === 0 ? (
                        <div className="text-center py-4 text-travel-text-muted flex flex-col items-center">
                            <FiMail size={20} className="mb-2 opacity-50" /> No requests yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {trip.joinRequests.map((req: JoinRequest) => (
                                <div key={req.id} className="flex justify-between items-center bg-travel-card p-4 rounded-xl border border-travel-border shadow-sm">
                                    <p className="font-bold text-sm truncate pr-2">{req.user.name}</p>
                                    {req.status === "pending" ? (
                                        <div className="flex gap-2 shrink-0">
                                            <button
                                                onClick={() => onAction(req.id, "accepted")}
                                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 cursor-pointer transition"
                                                title="Accept Request"
                                                aria-label="Accept Request"
                                            >
                                                <FiCheck />
                                            </button>
                                            <button
                                                onClick={() => onAction(req.id, "rejected")}
                                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer transition"
                                                title="Reject Request"
                                                aria-label="Reject Request"
                                            >
                                                <FiX />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-xs uppercase font-bold text-travel-text-muted">{req.status}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}