"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { useEffect } from "react";
import useAxiosAuth from "@/hooks/useAxiosAuth";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const axiosAuth = useAxiosAuth();
  // Helper to check if link is active
  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    if (status === "authenticated") {
      axiosAuth.get("/api/users/profile").catch(() => {
        // The error is caught here to prevent console noise, 
        // but the 'useAxiosAuth' interceptor has already triggered the logout.
      });
    }
  }, [status, axiosAuth]);

  return (
    <nav className="sticky top-0 z-50 w-full bg-travel-bg/80 backdrop-blur-md border-b border-travel-border transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">✈️</span>
            <span className="font-bold text-xl tracking-tight hidden sm:block bg-linear-to-r from-travel-accent to-orange-500 bg-clip-text text-transparent">
              Travel Buddy
            </span>
            <span className="font-bold text-xl text-travel-accent tracking-tight sm:hidden">
              TB
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 md:gap-4">

            {/* HOME LINK - Visible on desktop only */}
            <Link
              href="/"
              className={`hidden md:block px-3 py-2 rounded-full text-sm transition-all duration-200 ${isActive("/")
                  ? "bg-travel-accent/10 text-travel-accent font-bold"
                  : "text-travel-text-muted font-medium hover:text-travel-text hover:bg-gray-100/50 dark:hover:bg-white/5"
                }`}
            >
              Home
            </Link>

            {session ? (
              // IF LOGGED IN
              <>
                <Link
                  href="/dashboard"
                  className={`text-xs md:text-sm px-3 py-2 rounded-full transition-all duration-200 ${isActive("/dashboard")
                      ? "bg-travel-accent/10 text-travel-accent font-bold"
                      : "text-travel-text-muted font-medium hover:text-travel-text hover:bg-gray-100/50 dark:hover:bg-white/5"
                    }`}
                >
                  Dashboard
                </Link>

                <Link
                  href="/profile"
                  className={`text-xs md:text-sm px-3 py-2 rounded-full transition-all duration-200 ${isActive("/profile")
                      ? "bg-travel-accent/10 text-travel-accent font-bold"
                      : "text-travel-text-muted font-medium hover:text-travel-text hover:bg-gray-100/50 dark:hover:bg-white/5"
                    }`}
                >
                  Profile
                </Link>

                {/* CATCHY BUTTON: Gradient Background */}
                <Link
                  href="/trips/create"
                  className={`inline-flex items-center gap-1 leading-none
                  px-4 py-1 rounded-full text-xs md:text-sm font-bold text-white 
                  transition-all hover:scale-105 shadow-md hover:shadow-lg
                  ${isActive("/trips/create")
                      ? "bg-linear-to-r from-travel-accent-hover to-orange-600 ring-2 ring-offset-2 ring-travel-accent"
                      : "bg-linear-to-r from-travel-accent to-orange-500"
                    }`}
                >
                  <span className="text-base md:text-lg mb-1">+</span>
                  <span>Create <span className="hidden md:inline">Trip</span></span>
                </Link>

              </>
            ) : (
              // IF LOGGED OUT
              <>
                <Link
                  href="/auth/login"
                  className={`text-xs md:text-sm px-3 py-2 rounded-full transition-all duration-200 ${isActive("/auth/login")
                      ? "bg-travel-accent/10 text-travel-accent font-bold"
                      : "text-travel-text-muted font-medium hover:text-travel-text hover:bg-gray-100/50 dark:hover:bg-white/5"
                    }`}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 rounded-full text-xs md:text-sm font-bold text-white bg-linear-to-r from-travel-accent to-orange-500 hover:from-travel-accent-hover hover:to-orange-600 transition-all hover:scale-105 shadow-md"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Global Theme Toggle (Always visible) */}
            <div className="pl-2 border-l border-travel-border ml-1">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}