"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiGrid, FiMessageSquare, FiSettings } from "react-icons/fi";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Mobile Navigation Links
    const navLinks = [
        { name: "Home", href: "/", icon: <FiHome size={20} /> },
        { name: "Dashboard", href: "/dashboard", icon: <FiGrid size={20} /> },
        { name: "Messages", href: "/messages", icon: <FiMessageSquare size={20} /> },
        { name: "Settings", href: "/settings", icon: <FiSettings size={20} /> },
    ];

    return (
        <div className="h-screen bg-travel-bg overflow-hidden relative">

            {/* Main Content Area */}
            <div className="w-full h-full overflow-y-auto pb-20 md:pb-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="p-4 md:p-10 max-w-5xl mx-auto w-full">
                    <div className="mb-6 md:mb-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h1 className="text-2xl md:text-3xl font-bold text-travel-text">My Dashboard</h1>

                            {/* Tab Navigation */}
                            <div className="bg-travel-card border border-travel-border p-1 rounded-lg flex gap-1 shadow-sm overflow-x-auto">
                                <Link
                                    href="/dashboard/hosting"
                                    className={`flex-1 text-center px-6 py-2 text-sm font-bold rounded-md transition whitespace-nowrap ${pathname.includes('/hosting')
                                        ? 'bg-travel-accent text-white shadow-sm'
                                        : 'text-travel-text-muted cursor-pointer hover:text-travel-text hover:bg-travel-bg/50'
                                        }`}
                                >
                                    Hosting
                                </Link>
                                <Link
                                    href="/dashboard/joining"
                                    className={`flex-1 text-center px-6 py-2 text-sm font-bold rounded-md transition whitespace-nowrap ${pathname.includes('/joining')
                                        ? 'bg-travel-accent text-white shadow-sm'
                                        : 'text-travel-text-muted cursor-pointer hover:text-travel-text hover:bg-travel-bg/50'
                                        }`}
                                >
                                    Joining
                                </Link>
                            </div>
                        </div>
                    </div>

                    <main>
                        {children}
                    </main>
                </div>
            </div>

            {/* Mobile Bottom Navigation (Hidden on Desktop) */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-travel-card border-t border-travel-border flex justify-around items-center p-3 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                {navLinks.map((link) => {
                    const isActive = pathname.startsWith(link.href) && link.href !== "/" || pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer transition-colors ${isActive ? "text-travel-accent" : "text-travel-text-muted hover:text-travel-text"
                                }`}
                        >
                            {link.icon}
                            <span className="text-[10px] font-bold">{link.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}