"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname(); 

  // Helper to check if link is active
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full shadow-sm bg-travel-bg/80 backdrop-blur-md border-b border-travel-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">✈️</span>
            {/* Full text on desktop */}
            <span className="font-bold text-xl text-travel-text tracking-tight hidden sm:block">
              Travel Buddy
            </span>
            {/* Abbr on mobile to save space */}
            <span className="font-bold text-xl text-travel-text tracking-tight sm:hidden">
              TB
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-3 md:gap-6"> 
            
            {/* HOME LINK */}
            <Link 
              href="/" 
              className={`hidden md:block text-sm transition-all hover:scale-95 ${
                isActive("/") 
                  ? "text-travel-accent-hover font-bold"   
                  : "text-travel-text-muted font-medium hover:text-travel-text"
              }`}
            >
              Home
            </Link>

            {session ? (
              // IF LOGGED IN
              <>
                <Link 
                  href="/dashboard" 
                  className={`text-xs md:text-sm transition-all hover:scale-95 ${
                    isActive("/dashboard") 
                      ? "text-travel-accent-hover font-bold" 
                      : "text-travel-text-muted font-medium hover:text-travel-text"
                  }`}
                >
                  Dashboard
                </Link>

                <Link 
                  href="/profile" 
                  className={`text-xs md:text-sm transition-all hover:scale-95 ${
                    isActive("/profile") 
                      ? "text-travel-accent-hover font-bold" 
                      : "text-travel-text-muted font-medium hover:text-travel-text"
                  }`}
                >
                  Profile
                </Link>

                {/* Post Trip Button */}
                <Link 
                  href="/trips/create" 
                  className={`px-3 py-2 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all hover:scale-95 whitespace-nowrap ${
                    isActive("/trips/create")
                        ? "bg-travel-accent-hover text-white shadow-md"
                        : "bg-travel-accent text-white hover:bg-travel-accent-hover"
                  }`}
                >
                  + Create <span className="hidden md:inline">Trip</span>
                </Link>

                {/* Divider */}
                <div className="h-6 w-px bg-travel-border mx-1 md:mx-2"></div>

                <button 
                  onClick={() => signOut({ callbackUrl: "/" })} 
                  className="text-red-500 hover:text-red-700 font-medium text-xs md:text-sm transition-all hover:scale-95"
                >
                  Logout
                </button>
              </>
            ) : (
              // IF LOGGED OUT
              <>
                <Link 
                  href="/auth/login" 
                  className={`text-xs md:text-sm transition-all hover:scale-95 ${
                    isActive("/auth/login") 
                      ? "text-travel-accent-hover font-bold" 
                      : "text-travel-text-muted font-medium hover:text-travel-text"
                  }`}
                >
                  Login
                </Link>
                <Link 
                  href="/auth/register" 
                  className={`px-3 py-2 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all hover:scale-95 ${
                    isActive("/auth/register")
                        ? "bg-travel-accent-hover text-white"
                        : "bg-travel-accent text-white hover:bg-travel-accent-hover"
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