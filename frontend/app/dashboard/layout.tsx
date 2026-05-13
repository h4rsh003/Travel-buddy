"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="bg-travel-bg w-full pb-10">
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
    );
}