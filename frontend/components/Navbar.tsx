"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname(); 

  // Helper to check if link is active
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full shadow-sm bg-white/70 backdrop-blur-md border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">✈️</span>
            {/* Full text on desktop */}
            <span className="font-bold text-xl text-blue-600 tracking-tight hidden sm:block">
              Travel Buddy
            </span>
            {/* Abbr on mobile to save space */}
            <span className="font-bold text-xl text-blue-600 tracking-tight sm:hidden">
              TB
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-3 md:gap-6"> 
            
            {/* HOME LINK - Visible on desktop only */}
            <Link 
              href="/" 
              className={`hidden md:block text-sm transition-colors hover:scale-95 ${
                isActive("/") 
                  ? "text-blue-600 font-bold"   
                  : "text-gray-600 font-medium hover:text-blue-600"
              }`}
            >
              Home
            </Link>

            {session ? (
              // IF LOGGED IN
              <>
                <Link 
                  href="/dashboard" 
                  className={`text-xs md:text-sm transition-colors hover:scale-95 ${
                    isActive("/dashboard") 
                      ? "text-blue-600 font-bold" 
                      : "text-gray-600 font-medium hover:text-blue-600"
                  }`}
                >
                  Dashboard
                </Link>

                <Link 
                  href="/profile" 
                  className={`text-xs md:text-sm transition-colors hover:scale-95 ${
                    isActive("/profile") 
                      ? "text-blue-600 font-bold" 
                      : "text-gray-600 font-medium hover:text-blue-600"
                  }`}
                >
                  Profile
                </Link>

                {/* Post Trip Button (Responsive Text) */}
                <Link 
                  href="/trips/create" 
                  className={`px-3 py-2 md:px-4 md:py-2 rounded-full text-xs hover:scale-95 md:text-sm font-medium transition whitespace-nowrap ${
                    isActive("/trips/create")
                        ? "bg-blue-700 text-white shadow-md"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  + Create <span className="hidden md:inline">Trip</span>
                </Link>

              </>
            ) : (
              // IF LOGGED OUT
              <>
                <Link 
                  href="/auth/login" 
                  className={`text-xs md:text-sm transition-colors hover:scale-95 ${
                    isActive("/auth/login") 
                      ? "text-blue-600 font-bold" 
                      : "text-gray-600 font-medium hover:text-blue-600"
                  }`}
                >
                  Login
                </Link>
                <Link 
                  href="/auth/register" 
                  className={`px-3 py-2 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition hover:scale-95 ${
                    isActive("/auth/register")
                        ? "bg-blue-700 text-white"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}