"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useChatStore } from "@/stores/useChatStore";

const formatLocalDate = (dateString?: string) => {
    if (!dateString) return "";
    // FIX 1: Changed const to let
    let safeString = dateString.replace(' ', 'T');
    const timePart = safeString.split('T')[1];
    if (timePart && !safeString.endsWith('Z') && !timePart.includes('+') && !timePart.includes('-')) {
        safeString += 'Z';
    }
    const date = new Date(safeString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString();
};

export default function ChatSidebar() {
    const { data: session } = useSession();
    const myUserId = Number(session?.user?.id);

    const { conversations, activeConversationId, setActiveConversation, isLoadingInbox } = useChatStore();

    if (isLoadingInbox) {
        return (
            <div className="flex flex-col h-full bg-travel-card items-center justify-center p-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-travel-text-muted text-sm animate-pulse">Loading inbox...</p>
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col h-full bg-travel-card">
                <div className="p-4 border-b border-travel-border bg-travel-bg/50">
                    <h2 className="text-lg font-bold text-travel-text">Messages</h2>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-5">
                        <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>

                    <h3 className="text-lg font-semibold text-travel-text mb-2">No Buddies Yet</h3>
                    <p className="text-sm text-travel-text-muted mb-6 w-52 mx-auto">
                        You don&apos;t have any active chats. Join a trip or accept requests to start messaging!
                    </p>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow active:scale-95"
                    >
                        Explore Trips
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-travel-card">
            <div className="p-4 border-b border-travel-border bg-travel-bg/50">
                <h2 className="text-lg font-bold text-travel-text">Messages</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
                {conversations.map((chat) => {
                    const otherUser = chat.participants.find(p => String(p.id) !== String(myUserId)) || chat.participants[0];
                    return (
                        <div
                            key={chat.id}
                            onClick={() => setActiveConversation(chat.id)}
                            className={`p-4 border-b border-travel-border/50 cursor-pointer transition-colors duration-200 flex items-center gap-3 ${activeConversationId === chat.id
                                ? 'bg-blue-500/10'
                                : 'hover:bg-travel-bg'
                                }`}
                        >
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
                                {otherUser?.name?.charAt(0).toUpperCase() || "?"}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-semibold text-travel-text truncate">
                                        {chat.type === "GROUP" ? chat.trip?.title : otherUser?.name}
                                    </h3>
                                    <span className="text-xs text-travel-text-muted">
                                        {formatLocalDate(chat.lastMessageAt)}
                                    </span>
                                </div>
                                <p className="text-sm text-travel-text-muted truncate">
                                    {chat.trip?.destination
                                        ? `Trip to ${chat.trip.destination.name || chat.trip.destination.formattedAddress}`
                                        : "Tap to view messages"}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}