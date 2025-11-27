"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-blue-600">Travel Buddy 2.0 ✈️</h1>
        
        {session ? (
          // 🟢 If Logged In
          <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border">
            <h2 className="text-2xl font-bold">Welcome, {session.user?.name}! 👋</h2>
            <p className="text-gray-500">{session.user?.email}</p>
            
            <button 
              onClick={() => signOut()}
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          // 🔴 If Logged Out
          <div className="mt-8 space-x-4">
            {/* Updated Links to use /auth/ prefix */}
            <Link 
              href="/auth/login" 
              className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition"
            >
              Login
            </Link>
            <Link 
              href="/auth/register" 
              className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-full font-semibold hover:bg-blue-50 transition"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}