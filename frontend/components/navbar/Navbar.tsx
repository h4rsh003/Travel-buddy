"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import ThemeToggle from "@/components/ThemeToggle";

import UserDropdown from "./UserDropdown";
import MobileSidebar from "./MobileSidebar";
import LogoutModal from "./LogoutModal";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const axiosAuth = useAxiosAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  // Handle scroll shadow
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch profile logic
  useEffect(() => {
    if (status === "authenticated") {
      axiosAuth.get("/api/users/profile").catch(() => { });
    }
  }, [status, axiosAuth]);

  // Handle Logout Execution
  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    signOut({ callbackUrl: '/' });
  };

  const navLinkClass = (active: boolean) =>
    `flex items-center gap-1.5 text-sm transition-all duration-200 border-b-2 pb-1 ${active
      ? "border-travel-accent text-travel-accent font-bold"
      : "border-transparent text-travel-text-muted font-medium hover:text-travel-text hover:border-travel-border"
    }`;

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full bg-travel-bg/90 backdrop-blur-md border-b border-travel-border transition-all duration-300 ${isScrolled ? "shadow-lg shadow-black/5" : ""
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">

            <div className="shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">✈️</span>
                <span className="font-bold text-xl tracking-tight bg-linear-to-r from-travel-accent to-orange-500 bg-clip-text text-transparent">
                  Travel Buddy
                </span>
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              <Link href="/" className={navLinkClass(isActive("/"))}>
                <svg className="w-4 h-4 mb-0.5 hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>

              {session && (
                <Link href="/dashboard" className={navLinkClass(pathname.startsWith("/dashboard"))}>
                  <svg className="w-4 h-4 mb-0.5 hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Dashboard
                </Link>
              )}

              <div className="w-px h-6 bg-travel-border mx-1" />

              {session ? (
                <>
                  <Link
                    href="/trips/create"
                    className={`inline-flex items-center gap-1 leading-none px-4 py-1.5 rounded-full text-sm font-bold text-white transition-all hover:scale-105 shadow-md hover:shadow-lg bg-linear-to-r ${isActive("/trips/create")
                      ? "from-travel-accent-hover to-orange-600 ring-2 ring-offset-2 ring-travel-accent"
                      : "from-travel-accent to-orange-500"
                      }`}
                  >
                    <span className="text-lg mb-0.5">+</span>
                    <span>Create Trip</span>
                  </Link>

                  <Link
                    href="/messages"
                    className={`relative p-2 transition-colors rounded-full ${pathname.startsWith("/messages")
                      ? "text-travel-accent bg-travel-accent/10"
                      : "text-travel-text-muted hover:text-travel-accent hover:bg-travel-accent/10"
                      }`}
                    aria-label="Messages"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </Link>

                  <ThemeToggle />
                  <UserDropdown session={session} onLogoutClick={() => setIsLogoutModalOpen(true)} />
                </>
              ) : (
                <>
                  <ThemeToggle />
                  <Link href="/auth/login" className="text-sm px-4 py-2 rounded-full font-medium text-travel-text hover:bg-travel-accent/5 hover:text-travel-accent transition-colors">
                    Log in
                  </Link>
                  <Link href="/auth/register" className="px-5 py-2 rounded-full text-sm font-bold text-white bg-linear-to-r from-travel-accent to-orange-500 hover:from-travel-accent-hover hover:to-orange-600 transition-all hover:scale-105 shadow-md">
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            <div className="flex md:hidden items-center gap-3">
              {session ? (
                <>
                  <Link
                    href="/trips/create"
                    className="text-white bg-linear-to-r from-travel-accent to-orange-500 px-4 py-1.5 rounded-full text-xs font-bold shadow-md hover:scale-105 transition-transform"
                  >
                    + Plan
                  </Link>
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Open Menu"
                    className="p-2 -mr-2 text-travel-text focus:outline-none"
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-sm font-medium text-travel-text px-2">
                    Log in
                  </Link>
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Open Menu"
                    className="p-2 -mr-2 text-travel-text focus:outline-none"
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <MobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        session={session}
        pathname={pathname}
        onLogoutClick={() => setIsLogoutModalOpen(true)}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}