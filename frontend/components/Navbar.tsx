"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* 🟢 Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <span className="font-bold text-xl text-blue-600 tracking-tight">
              Travel Buddy
            </span>
          </Link>

          {/* 🟢 Navigation Links */}
          <div className="flex items-center gap-6"> {/* Increased gap for better spacing */}
            
            {/* 🏠 ALWAYS VISIBLE HOME LINK */}
            <Link 
              href="/" 
              className="text-gray-600 hover:text-blue-600 font-medium text-sm transition"
            >
              Home
            </Link>

            {session ? (
              // ✅ IF LOGGED IN
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-blue-600 font-medium text-sm transition"
                >
                  Dashboard
                </Link>

                <Link 
                  href="/profile" 
                  className="text-gray-600 hover:text-blue-600 font-medium text-sm transition"
                >
                  Profile
                </Link>

                {/* Post Trip Button (Distinct Style) */}
                <Link 
                  href="/trips/create" 
                  className="hidden md:block px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition"
                >
                  + Post Trip
                </Link>

                <div className="h-6 w-px bg-gray-300 mx-2"></div>

                <button 
                  onClick={() => signOut({ callbackUrl: "/" })} 
                  className="text-red-500 hover:text-red-700 font-medium text-sm transition"
                >
                  Logout
                </button>
              </>
            ) : (
              // 🔴 IF LOGGED OUT
              <>
                <Link 
                  href="/auth/login" 
                  className="text-gray-600 hover:text-blue-600 font-medium text-sm transition"
                >
                  Login
                </Link>
                <Link 
                  href="/auth/register" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition"
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