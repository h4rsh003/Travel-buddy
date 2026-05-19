"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { useEffect, useState } from "react";
import useAxiosAuth from "@/hooks/useAxiosAuth";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const axiosAuth = useAxiosAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [isScrolled, setIsScrolled] = useState(false); // 🆕 Scroll state

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsSidebarOpen(false);
  }

  const isActive = (path: string) => pathname === path;

  // 🆕 Scroll listener
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      axiosAuth.get("/api/users/profile").catch(() => { });
    }
  }, [status, axiosAuth]);

  const navLinkClass = (active: boolean) =>
    `flex items-center gap-1.5 text-sm transition-all duration-200 border-b-2 pb-1 ${active
      ? "border-travel-accent text-travel-accent font-bold"
      : "border-transparent text-travel-text-muted font-medium hover:text-travel-text hover:border-travel-border"
    }`;

  const sidebarLinkClass = (active: boolean) =>
    `flex items-center gap-3 p-3 rounded-xl transition-colors ${active
      ? "bg-travel-accent/10 text-travel-accent font-semibold"
      : "text-travel-text hover:bg-travel-accent/5 hover:text-travel-accent"
    }`;

  // 🆕 User initials helper
  const getUserInitials = () => {
    const name = session?.user?.name;
    if (!name) return "T";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <>
      {/* 🆕 Shadow on scroll */}
      <nav className={`sticky top-0 z-50 w-full bg-travel-bg/90 backdrop-blur-md border-b border-travel-border transition-all duration-300 ${isScrolled ? "shadow-lg shadow-black/5" : ""
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">

            {/* Logo */}
            <div className="shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">✈️</span>
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-travel-accent to-orange-500 bg-clip-text text-transparent">
                  Travel Buddy
                </span>
              </Link>
            </div>

            {/* Desktop Nav */}
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
                    className={`inline-flex items-center gap-1 leading-none px-4 py-1.5 rounded-full text-sm font-bold text-white transition-all hover:scale-105 shadow-md hover:shadow-lg bg-gradient-to-r ${isActive("/trips/create")
                      ? "from-travel-accent-hover to-orange-600 ring-2 ring-offset-2 ring-travel-accent"
                      : "from-travel-accent to-orange-500"
                      }`}
                  >
                    <span className="text-lg mb-0.5">+</span>
                    <span>Create Trip</span>
                  </Link>

                  {/* Messages Icon */}
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

                  {/* 🆕 User Avatar Dropdown with Initials */}
                  <div className="relative group ml-1">
                    <button
                      aria-label="User menu"
                      className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-travel-border group-hover:border-travel-accent transition-all duration-200 overflow-hidden focus:outline-none bg-gradient-to-br from-travel-accent to-orange-500"
                    >
                      <span className="text-white font-bold text-sm leading-none">
                        {getUserInitials()}
                      </span>
                    </button>

                    <div className="absolute right-0 top-full mt-2 w-48 bg-travel-card border border-travel-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right overflow-hidden">
                      <div className="p-3 border-b border-travel-border bg-travel-bg">
                        <p className="text-sm font-medium truncate text-travel-text">{session?.user?.name || 'Traveler'}</p>
                        <p className="text-xs text-travel-text-muted truncate">{session?.user?.email}</p>
                      </div>
                      <div className="p-2 space-y-1">
                        <Link
                          href="/profile"
                          className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${isActive("/profile")
                            ? "bg-travel-accent/10 text-travel-accent"
                            : "text-travel-text hover:bg-travel-accent/5 hover:text-travel-accent"
                            }`}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Profile
                        </Link>
                        <button
                          onClick={() => signOut({ callbackUrl: '/' })}
                          className="w-full flex items-center px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-left cursor-pointer"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <ThemeToggle />
                  <Link href="/auth/login" className="text-sm px-4 py-2 rounded-full font-medium text-travel-text hover:bg-travel-accent/5 hover:text-travel-accent transition-colors">
                    Log in
                  </Link>
                  <Link href="/auth/register" className="px-5 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r from-travel-accent to-orange-500 hover:from-travel-accent-hover hover:to-orange-600 transition-all hover:scale-105 shadow-md">
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            <div className="flex md:hidden items-center gap-2">
              {session ? (
                <>
                  {/* Revert: Original Create Trip button */}
                  <Link
                    href="/trips/create"
                    className="text-white bg-gradient-to-r from-travel-accent to-orange-500 px-4 py-1.5 rounded-full text-xs font-bold shadow-md hover:scale-105 transition-transform"
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

      {/* Mobile Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed inset-y-0 right-0 w-[80vw] max-w-sm bg-travel-bg border-l border-travel-border z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col shadow-2xl`}>

        <div className="flex items-center justify-between p-5 border-b border-travel-border bg-travel-card">
          <span className="font-bold text-xl text-travel-text tracking-tight">Menu</span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 -mr-2 text-travel-text-muted hover:text-travel-accent focus:outline-none"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col p-4 gap-3 flex-1 overflow-y-auto bg-travel-bg">
          {session ? (
            <>
              {/* 🆕 User Info Card with Initials Avatar */}
              <div className="flex items-center gap-4 p-3 bg-travel-card border border-travel-border rounded-2xl mb-2">
                <div className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-travel-accent to-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg leading-none">
                    {getUserInitials()}
                  </span>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-travel-text truncate">{session?.user?.name || 'Traveler'}</span>
                  <span className="text-xs text-travel-text-muted truncate">{session?.user?.email}</span>
                </div>
              </div>

              <Link href="/" className={sidebarLinkClass(isActive("/"))}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>

              <Link href="/dashboard" className={sidebarLinkClass(pathname.startsWith("/dashboard"))}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Dashboard
              </Link>

              <Link href="/messages" className={sidebarLinkClass(pathname.startsWith("/messages"))}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Messages
              </Link>

              <Link href="/profile" className={sidebarLinkClass(isActive("/profile"))}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile Settings
              </Link>

              <div className="flex items-center justify-between p-3 rounded-xl text-travel-text hover:bg-travel-accent/5 transition-colors">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">Theme</span>
                </div>
                <ThemeToggle />
              </div>

              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-red-500 hover:bg-red-500/10 font-medium text-left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="flex items-center gap-3 p-3 rounded-xl text-travel-text hover:bg-travel-accent/5 hover:text-travel-accent transition-colors">
                Log in
              </Link>
              <Link href="/auth/register" className="flex items-center gap-3 p-3 rounded-xl bg-travel-accent/10 text-travel-accent font-bold hover:bg-travel-accent/20 transition-colors">
                Sign Up Free
              </Link>
              <div className="flex items-center justify-between p-3 rounded-xl text-travel-text hover:bg-travel-accent/5 transition-colors">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">Theme</span>
                </div>
                <ThemeToggle />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}