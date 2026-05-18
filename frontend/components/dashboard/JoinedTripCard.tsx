import Link from "next/link";
import { FiCalendar, FiMessageCircle } from "react-icons/fi";
import { JoinedTrip } from "@/types/dashboard";

export default function JoinedTripCard({ request }: { request: JoinedTrip }) {

    const statusConfig = {
        accepted: "bg-green-100 text-green-700 border-green-200",
        rejected: "bg-red-100 text-red-700 border-red-200",
        pending: "bg-orange-100 text-orange-700 border-orange-200"
    };

    const statusKey = request.status?.toLowerCase() as keyof typeof statusConfig;
    const badgeColors = statusConfig[statusKey] || statusConfig.pending;

    const destinationName = typeof request.trip.destination === 'string'
        ? request.trip.destination
        : request.trip.destination?.name;

    return (
        <div className="bg-travel-card rounded-xl shadow-sm border border-travel-border p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:shadow-md mb-4 group">

            <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-bold text-travel-text group-hover:text-travel-accent transition-colors">
                        {destinationName}
                    </h3>
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${badgeColors}`}>
                        {request.status}
                    </span>
                </div>

                <p className="text-sm text-travel-text-muted flex items-center gap-2 font-medium">
                    <FiCalendar className="text-travel-accent" />
                    {new Date(request.trip.startDate).toLocaleDateString("en-IN", {
                        day: 'numeric', month: 'short', year: 'numeric'
                    })}
                    {" — "}
                    {new Date(request.trip.endDate).toLocaleDateString("en-IN", {
                        day: 'numeric', month: 'short', year: 'numeric'
                    })}
                </p>

                <p className="text-sm font-medium text-travel-text mt-1 bg-travel-bg inline-block px-3 py-1 rounded-md self-start border border-travel-border">
                    Hosted by: <span className="text-travel-accent font-bold">{request.trip.user.name}</span>
                </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                <Link
                    href={`/trips/${request.trip.id}`}
                    className="flex-1 md:flex-none text-center px-6 py-2.5 bg-travel-bg border border-travel-border hover:border-travel-accent hover:text-travel-accent text-travel-text font-bold rounded-lg transition-colors shadow-sm"
                >
                    View Trip
                </Link>

                {request.status === 'accepted' && (
                    <Link
                        href="/messages"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-md font-medium hover:bg-blue-100 transition text-sm w-full justify-center sm:w-auto"
                    >
                        <FiMessageCircle /> Message Host
                    </Link>
                )}
            </div>
        </div>
    );
}