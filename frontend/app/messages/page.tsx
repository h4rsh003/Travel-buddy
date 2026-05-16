"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/stores/useChatStore";
import { connectSocket, disconnectSocket } from "@/libs/socket";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";

export default function MessagesPage() {
    const { status, data: session } = useSession();
    const router = useRouter();
    const { fetchConversations, activeConversationId } = useChatStore();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (status === "authenticated") {
            fetchConversations();

            if (session?.user?.accessToken) {
                connectSocket(session.user.accessToken);
            }
        }

        return () => {
            disconnectSocket();
        };
    }, [fetchConversations, status, session]);

    if (status === "loading") {
        return (
            <div className="flex h-[calc(100dvh-80px)] w-full items-center justify-center bg-travel-bg border-t border-travel-border">
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-travel-text-muted font-medium animate-pulse">Loading your messages...</p>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return null;
    }

    return (
        <div className="flex h-[calc(100dvh-80px)] w-full bg-travel-bg border-t border-travel-border overflow-hidden">
            <div className={`w-full md:w-1/3 lg:w-1/4 border-r border-travel-border bg-travel-card ${activeConversationId ? 'hidden md:block' : 'block'
                }`}>
                <ChatSidebar />
            </div>

            <div className={`flex-1 ${!activeConversationId ? 'hidden md:flex' : 'flex'}`}>
                {activeConversationId ? (
                    <ChatWindow />
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full text-travel-text-muted bg-travel-bg">
                        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                        <h2 className="text-xl font-semibold text-travel-text">Your Trip Hub</h2>
                        <p>Select a conversation to start planning.</p>
                    </div>
                )}
            </div>
        </div>
    );
}