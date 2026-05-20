"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { Session } from "next-auth";

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    session: Session | null;
    pathname: string;
    onLogoutClick: () => void;
}

export default function MobileSidebar({ isOpen, onClose, session, pathname, onLogoutClick }: MobileSidebarProps) {
    const isActive = (path: string) => pathname === path;

    const sidebarLinkClass = (active: boolean) =>
        `flex items-center gap-3 p-3 rounded-xl transition-colors ${active
            ? "bg-travel-accent/10 text-travel-accent font-semibold"
            : "text-travel-text hover:bg-travel-accent/5 hover:text-travel-accent"
        }`;

    const getUserInitials = () => {
        const name = session?.user?.name;
        if (!name) return "T";
        const parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    return (
        <>
            <div
                className={`md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
            />

            <div
                className={`md:hidden fixed inset-y-0 right-0 w-[80vw] max-w-sm bg-travel-bg border-l border-travel-border z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    } flex flex-col shadow-2xl`}
            >
                <div className="flex items-center justify-between p-5 border-b border-travel-border bg-travel-card">
                    <span className="font-bold text-xl text-travel-text tracking-tight">Menu</span>
                    <button
                        onClick={onClose}
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
                            <div className="flex items-center gap-4 p-3 bg-travel-card border border-travel-border rounded-2xl mb-2">
                                <div className="shrink-0 w-12 h-12 rounded-full bg-linear-to-br from-travel-accent to-orange-500 flex items-center justify-center">
                                    <span className="text-white font-bold text-lg leading-none">{getUserInitials()}</span>
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-bold text-travel-text truncate">{session?.user?.name || 'Traveler'}</span>
                                    <span className="text-xs text-travel-text-muted truncate">{session?.user?.email}</span>
                                </div>
                            </div>

                            <Link href="/" onClick={onClose} className={sidebarLinkClass(isActive("/"))}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Home
                            </Link>

                            <Link href="/dashboard" onClick={onClose} className={sidebarLinkClass(pathname.startsWith("/dashboard"))}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                Dashboard
                            </Link>

                            <Link href="/messages" onClick={onClose} className={sidebarLinkClass(pathname.startsWith("/messages"))}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                Messages
                            </Link>

                            <Link href="/profile" onClick={onClose} className={sidebarLinkClass(isActive("/profile"))}>
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
                                onClick={() => {
                                    onClose();
                                    onLogoutClick();
                                }}
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
                            <Link href="/auth/login" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl text-travel-text hover:bg-travel-accent/5 hover:text-travel-accent transition-colors">
                                Log in
                            </Link>
                            <Link href="/auth/register" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl bg-travel-accent/10 text-travel-accent font-bold hover:bg-travel-accent/20 transition-colors">
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