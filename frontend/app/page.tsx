"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTripStore } from "@/stores/tripStore";

export default function Home() {
  const {
    loading,
    fetchTrips,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    getFilteredTrips
  } = useTripStore();

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const filteredTrips = getFilteredTrips();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getTripStatus = (start: string, end: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);

    if (endDate < today) return 'COMPLETED';
    if (startDate <= today && endDate >= today) return 'STARTED';
    return 'UPCOMING';
  };

  return (
    <main className="min-h-screen bg-travel-bg">

      {/* HERO SECTION */}
      <div className="relative bg-travel-card border-b border-travel-border overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-travel-accent to-orange-500"></div>

        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center md:text-left relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-travel-text leading-tight">
            Find your next <br className="hidden md:block" />
            <span className="bg-linear-to-r from-travel-accent to-orange-500 bg-clip-text text-transparent">
              Travel Adventure
            </span>
          </h1>
          <p className="text-lg md:text-xl text-travel-text-muted max-w-2xl mb-8 mx-auto md:mx-0 leading-relaxed">
            Do not travel alone. Connect with like-minded explorers, split costs, and create unforgettable memories together.
          </p>

          {/* Search Bar */}
          <div className="max-w-lg mx-auto md:mx-0 bg-travel-bg p-2 rounded-full border border-travel-border flex items-center shadow-lg focus-within:ring-2 focus-within:ring-travel-accent transition-all transform hover:scale-[1.01]">
            {/* Search Icon (inline SVG — no react-icons dependency) */}
            <svg className="ml-4 w-5 h-5 text-travel-text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search destination (e.g. Goa, Paris)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-travel-text placeholder:text-travel-text-muted px-4 py-3 outline-none w-full min-w-0"
            />
            <button className="hidden cursor-pointer sm:block bg-travel-text text-travel-bg px-8 py-3 rounded-full font-bold hover:opacity-90 transition shadow-md whitespace-nowrap">
              Search
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-travel-accent/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      </div>

      {/* FEED SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">

        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-travel-text">Latest Trips</h2>
            <p className="text-travel-text-muted mt-1">Discover where people are going next.</p>
          </div>

          <div className="flex bg-travel-card border border-travel-border rounded-lg p-1 w-full md:w-auto overflow-x-auto">
            {(['ALL', 'UPCOMING', 'STARTED', 'COMPLETED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-md transition-all whitespace-nowrap cursor-pointer ${filter === f
                  ? 'bg-travel-accent text-white shadow-sm'
                  : 'text-travel-text-muted hover:bg-travel-bg hover:text-travel-text'
                  }`}
              >
                {f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-travel-accent mb-4"></div>
            <p className="text-travel-text-muted animate-pulse">Finding best trips...</p>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="text-center py-24 bg-travel-card rounded-3xl border-2 border-dashed border-travel-border">
            <div className="text-6xl mb-4 opacity-50">🌏</div>
            <h3 className="text-xl font-bold text-travel-text mb-2">No trips found</h3>
            <p className="text-travel-text-muted mb-8 max-w-md mx-auto">
              {searchQuery
                ? `We couldn't find any trips matching "${searchQuery}".`
                : filter === 'ALL'
                  ? "Be the pioneer and post the first journey of the season!"
                  : `No ${filter.toLowerCase()} trips available right now.`}
            </p>
            <Link
              href="/trips/create"
              className="bg-travel-accent text-white px-8 py-3 rounded-full font-bold hover:bg-travel-accent-hover transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
            >
              Post a Trip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTrips.map((trip) => {
              const status = getTripStatus(trip.startDate, trip.endDate);

              return (
                <div
                  key={trip.id}
                  className="group flex flex-col bg-travel-card rounded-2xl shadow-sm border border-travel-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full relative"
                >
                  {/* Status Badges — inline SVG icons */}
                  {status === 'STARTED' && (
                    <div className="absolute top-3 right-3 bg-blue-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1 z-20">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Live
                    </div>
                  )}
                  {status === 'COMPLETED' && (
                    <div className="absolute top-3 right-3 bg-gray-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1 z-20">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Done
                    </div>
                  )}

                  {/* Card Header */}
                  <div className={`h-40 flex items-center justify-center border-b border-travel-border relative overflow-hidden ${status === 'COMPLETED'
                    ? 'bg-travel-bg'
                    : 'bg-linear-to-br from-travel-accent/20 to-orange-100 dark:from-travel-accent/10 dark:to-orange-900/20'
                    }`}>
                    <div className="absolute inset-0 bg-travel-accent/5 group-hover:bg-travel-accent/10 transition-colors"></div>
                    <h3 className={`text-3xl font-extrabold group-hover:scale-110 transition-transform duration-500 z-10 px-4 text-center ${status === 'COMPLETED' ? 'text-travel-text-muted' : 'text-travel-accent'
                      }`}>
                      {trip.destination?.name}
                    </h3>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-1.5 text-travel-text-muted text-xs font-semibold bg-travel-bg px-2.5 py-1.5 rounded-lg border border-travel-border">
                        {/* Calendar icon */}
                        <svg className="w-3.5 h-3.5 text-travel-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(trip.startDate)}
                      </div>
                      <div className="text-sm font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2.5 py-1.5 rounded-lg border border-green-100 dark:border-green-800">
                        ₹{trip.budget.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-start gap-2 mb-3">
                      {/* Map pin icon */}
                      <svg className="w-4 h-4 text-travel-accent mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <h3 className="text-lg font-bold text-travel-text leading-tight group-hover:text-travel-accent transition-colors">
                        Trip to {trip.destination?.name}
                      </h3>
                    </div>

                    <p className="text-travel-text-muted text-sm line-clamp-2 leading-relaxed mb-6 flex-1">
                      {trip.description}
                    </p>

                    {/* Card Footer */}
                    <div className="pt-5 border-t border-travel-border flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-linear-to-br from-travel-accent to-orange-500 text-white flex items-center justify-center text-sm font-bold shadow-sm ring-2 ring-white dark:ring-travel-card">
                          {trip.user.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-travel-text-muted font-semibold">Hosted by</span>
                          <span className="text-xs font-bold text-travel-text truncate max-w-20">
                            {trip.user.name.split(" ")[0]}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/trips/${trip.id}`}
                        className="text-sm font-bold text-travel-accent hover:text-orange-600 transition-colors flex items-center gap-1 group/link bg-travel-bg px-3 py-1.5 rounded-full border border-travel-border hover:border-travel-accent"
                      >
                        View <span className="group-hover/link:translate-x-1 transition-transform inline-block ml-1">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}