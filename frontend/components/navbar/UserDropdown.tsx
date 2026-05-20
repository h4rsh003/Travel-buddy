"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Session } from "next-auth";

interface UserDropdownProps {
    session: Session | null;
    onLogoutClick: () => void;
}

export default function UserDropdown({ session, onLogoutClick }: UserDropdownProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isActive = (path: string) => pathname === path;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getUserInitials = () => {
        const name = session?.user?.name;
        if (!name) return "T";
        const parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    return (
        <div className="relative ml-1" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="User menu"
                {...{ "aria-expanded": isOpen }}
                className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all duration-200 overflow-hidden focus:outline-none bg-linear-to-br from-travel-accent to-orange-500 ${isOpen ? "border-travel-accent ring-2 ring-travel-accent/20" : "border-travel-border hover:border-travel-accent"
                    }`}
            >
                <span className="text-white font-bold text-sm leading-none">
                    {getUserInitials()}
                </span>
            </button>

            <div
                className={`absolute right-0 top-full mt-2 w-48 bg-travel-card border border-travel-border rounded-xl shadow-xl transition-all duration-200 transform origin-top-right overflow-hidden z-50 ${isOpen ? "opacity-100 visible scale-100" : "opacity-0 invisible scale-95 pointer-events-none"
                    }`}
            >
                <div className="p-3 border-b border-travel-border bg-travel-bg">
                    <p className="text-sm font-medium truncate text-travel-text">{session?.user?.name || 'Traveler'}</p>
                    <p className="text-xs text-travel-text-muted truncate">{session?.user?.email}</p>
                </div>
                <div className="p-2 space-y-1">
                    <Link
                        href="/profile"
                        onClick={() => setIsOpen(false)}
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
                        onClick={() => {
                            setIsOpen(false);
                            onLogoutClick();
                        }}
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
    );
}