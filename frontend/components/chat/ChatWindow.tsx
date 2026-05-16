"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useChatStore, Message } from "@/stores/useChatStore";
import { socket, connectSocket } from "@/libs/socket";
import DOMPurify from "isomorphic-dompurify";
import { useRouter } from "next/navigation";

const formatLocalTime = (dateString?: string) => {
    if (!dateString) return "";
    let safeString = dateString.replace(' ', 'T');
    const timePart = safeString.split('T')[1];

    if (timePart && !safeString.endsWith('Z') && !timePart.includes('+') && !timePart.includes('-')) {
        safeString += 'Z';
    }

    const date = new Date(safeString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const handleInputFocus = () => {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 50);
};

const handleInputBlur = () => {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 50);
};

export default function ChatWindow() {
    const { data: session } = useSession();
    const myUserId = Number(session?.user?.id);
    const router = useRouter();

    const currentUser = {
        id: myUserId,
        name: session?.user?.name || "Traveler"
    };

    const {
        conversations,
        activeConversationId,
        messages,
        isLoadingMessages,
        hasMoreMessages,
        sendMessage,
        addMessage,
        deleteMessage,
        loadMoreMessages,
        updateMessageStatus,
        setMessagesDeleted
    } = useChatStore();

    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
    const [inputText, setInputText] = useState("");

    const [typingUsers, setTypingUsers] = useState<{ id: number, name: string }[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [showScrollDown, setShowScrollDown] = useState(false);
    const isUserScrolledUp = useRef(false);

    const activeChat = conversations.find(c => c.id === activeConversationId);
    const otherUser = activeChat?.participants.find(p => String(p.id) !== String(myUserId)) || activeChat?.participants[0];

    const selectedMessages = messages.filter(msg => selectedIds.includes(msg.id));

    const canDeleteForEveryone = selectedMessages.length > 0 && selectedMessages.every(msg =>
        String(msg.sender.id) === String(myUserId) && !msg.isDeletedForEveryone
    );

    const handleTouchStart = (id: string | number) => {
        if (isSelectionMode) return;

        longPressTimerRef.current = setTimeout(() => {
            setIsSelectionMode(true);
            setSelectedIds([id]);

            if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate(50);
            }
        }, 500);
    };

    const clearLongPress = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    };

    useEffect(() => {
        if (session?.user?.accessToken) {
            connectSocket(session.user.accessToken);
        }
    }, [session]);

    useEffect(() => {
        if (!isUserScrolledUp.current && messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages]);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        if (!target || !activeConversationId) return;

        const { scrollTop, scrollHeight, clientHeight } = target;
        const distanceToBottom = scrollHeight - Math.ceil(scrollTop) - clientHeight;
        const isScrolledUp = distanceToBottom > 50;

        isUserScrolledUp.current = isScrolledUp;
        setShowScrollDown(isScrolledUp);

        if (scrollTop < 100 && hasMoreMessages && !isLoadingMessages) {
            loadMoreMessages(activeConversationId);
        }
    }, [activeConversationId, hasMoreMessages, isLoadingMessages, loadMoreMessages]);

    const handleScrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: "smooth"
            });
            setShowScrollDown(false);
            isUserScrolledUp.current = false;
        }
    };

    useEffect(() => {
        if (!activeConversationId) return;

        const joinCurrentRoom = () => {
            setIsConnected(true);
            socket.emit("join_room", activeConversationId);
        };

        if (socket.connected) {
            joinCurrentRoom();
        }

        const handleConnect = () => joinCurrentRoom();
        const handleDisconnect = () => setIsConnected(false);
        const handleConnectError = (error: Error) => {
            console.error("Socket connection error:", error);
            setIsConnected(false);
        };

        const handleReceiveMessage = (newMessage: Message) => {
            if (String(newMessage.sender.id) !== String(myUserId)) {
                addMessage(newMessage);

                setTimeout(() => {
                    socket.emit("mark_as_read", {
                        conversationId: activeConversationId,
                        messageIds: [newMessage.id]
                    });
                }, 500);
            }
        };

        const handleMessageDeleted = ({ messageId, type }: { messageId: number, type: "ME" | "EVERYONE" }) => {
            if (setMessagesDeleted) setMessagesDeleted(messageId, type);
        };

        const handleUserTyping = ({ userId, userName }: { userId: number; userName: string }) => {
            if (String(userId) === String(myUserId)) return;
            setTypingUsers(prev =>
                prev.some(u => String(u.id) === String(userId)) ? prev : [...prev, { id: userId, name: userName }]
            );
        };

        const handleUserStoppedTyping = ({ userId }: { userId: number }) => {
            setTypingUsers(prev => prev.filter(u => String(u.id) !== String(userId)));
        };

        const handleMessagesRead = ({ messageIds }: { messageIds: number[] }) => {
            updateMessageStatus(messageIds, "READ");
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);
        socket.on("receive_message", handleReceiveMessage);
        socket.on("message_deleted", handleMessageDeleted);
        socket.on("user_typing", handleUserTyping);
        socket.on("user_stopped_typing", handleUserStoppedTyping);
        socket.on("messages_read", handleMessagesRead);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
            socket.off("receive_message", handleReceiveMessage);
            socket.off("message_deleted", handleMessageDeleted);
            socket.off("user_typing", handleUserTyping);
            socket.off("user_stopped_typing", handleUserStoppedTyping);
            socket.off("messages_read", handleMessagesRead);
        };
    }, [activeConversationId, addMessage, myUserId, updateMessageStatus, setMessagesDeleted]);

    useEffect(() => {
        if (!activeConversationId || messages.length === 0) return;

        const unreadMessages = messages.filter(
            msg => String(msg.sender.id) !== String(myUserId) && msg.status !== "READ"
        );

        if (unreadMessages.length > 0) {
            const unreadIds = unreadMessages.map(msg => msg.id as number);
            socket.emit("mark_as_read", {
                conversationId: activeConversationId,
                messageIds: unreadIds
            });
        }
    }, [messages, activeConversationId, myUserId]);

    const toggleSelection = (id: string | number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    const cancelSelection = () => {
        setIsSelectionMode(false);
        setSelectedIds([]);
    };

    const handleBulkDelete = (type: "ME" | "EVERYONE") => {
        if (selectedIds.length === 0) return;

        const confirmMsg = type === "EVERYONE"
            ? `Delete ${selectedIds.length} message(s) for everyone?`
            : `Delete ${selectedIds.length} message(s) for yourself?`;

        if (window.confirm(confirmMsg)) {
            selectedIds.forEach(id => {
                deleteMessage(activeConversationId!, id as number, type, myUserId);
            });
            cancelSelection();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);

        socket.emit("typing", {
            conversationId: activeConversationId,
            userName: currentUser.name
        });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stop_typing", { conversationId: activeConversationId });
        }, 1000);
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !activeConversationId) return;

        socket.emit("stop_typing", { conversationId: activeConversationId });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        isUserScrolledUp.current = false;
        setShowScrollDown(false);

        sendMessage(activeConversationId, inputText, currentUser);
        setInputText("");
    };

    if (!activeChat) return null;

    return (
        <div className="flex flex-col h-full w-full bg-travel-bg overflow-hidden relative">

            <div className="flex-none flex items-center justify-between p-4 bg-travel-card border-b border-travel-border shadow-sm z-40">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => isSelectionMode ? cancelSelection() : router.push('/messages')}
                        className="p-2 rounded-full hover:bg-travel-bg text-travel-text-muted transition-colors"
                        aria-label="Go back"
                        title="Go back"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="font-semibold text-travel-text">
                                {isSelectionMode
                                    ? `${selectedIds.length} Selected`
                                    : (activeChat.type === "GROUP" ? activeChat.trip?.title : otherUser?.name)
                                }
                            </h2>
                            {!isConnected && (
                                <span className="text-xs text-orange-500">● Connecting...</span>
                            )}
                        </div>
                        {!isSelectionMode && activeChat.trip?.destination && (
                            <p className="text-xs text-travel-text-muted">
                                Planning: {activeChat.trip.destination.name || activeChat.trip.destination.formattedAddress}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex gap-2">
                    {isSelectionMode ? (
                        <div className="flex items-center gap-2">
                            {canDeleteForEveryone ? (
                                <>
                                    <button
                                        onClick={() => handleBulkDelete("EVERYONE")}
                                        className="flex items-center gap-1.5 text-xs sm:text-sm bg-red-600/10 text-red-600 px-3 py-1.5 rounded-full hover:bg-red-600/20 transition-colors shadow-sm font-medium border border-red-200"
                                        title="Delete for everyone in chat"
                                    >
                                        <svg className="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        For Everyone
                                    </button>
                                    <button
                                        onClick={() => handleBulkDelete("ME")}
                                        className="flex items-center gap-1.5 text-xs sm:text-sm bg-gray-600 text-white px-3 py-1.5 rounded-full hover:bg-gray-700 transition-colors shadow-sm font-medium"
                                        title="Delete only for me"
                                    >
                                        <svg className="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        For Me
                                    </button>
                                </>
                            ) : (
                                // ✅ If only "Delete for Me" is allowed, show a clean Trash icon button
                                <button
                                    onClick={() => handleBulkDelete("ME")}
                                    disabled={selectedIds.length === 0}
                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors disabled:opacity-50"
                                    title="Delete for me"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsSelectionMode(true)}
                            className="text-sm text-blue-600 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-1.5 rounded-full transition-colors"
                        >
                            Select
                        </button>
                    )}
                </div>
            </div>

            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 h-0 overflow-y-auto p-4 space-y-4 bg-travel-bg overscroll-contain"
            >
                {hasMoreMessages && !isLoadingMessages && messages.length >= 50 && (
                    <div className="p-2 w-full flex justify-center mb-2">
                        <button
                            onClick={() => loadMoreMessages(activeConversationId!)}
                            className="text-sm bg-travel-card px-4 py-1 rounded-full shadow-sm text-blue-600 hover:underline"
                        >
                            Load older messages
                        </button>
                    </div>
                )}

                {isLoadingMessages && messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full text-travel-text-muted">
                        Loading...
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-xs text-travel-text-muted mt-10">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages
                        .filter(msg => !msg.deletedBy?.includes(myUserId))
                        .map((msg) => {
                            const isMe = String(msg.sender.id) === String(myUserId);
                            const isSelected = selectedIds.includes(msg.id);

                            return (
                                <div
                                    key={msg.id}
                                    className={`flex items-center gap-3 transition-all p-1 rounded-lg ${isMe ? 'flex-row-reverse' : 'flex-row'
                                        } ${isSelectionMode ? 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/5' : ''
                                        }`}
                                    onClick={() => isSelectionMode && toggleSelection(msg.id)}
                                    // Touch and Mouse events wrapper
                                    onTouchStart={() => handleTouchStart(msg.id)}
                                    onTouchEnd={clearLongPress}
                                    onTouchMove={clearLongPress}
                                    onMouseDown={() => handleTouchStart(msg.id)}
                                    onMouseUp={clearLongPress}
                                    onMouseLeave={clearLongPress}
                                    onContextMenu={(e) => {
                                        if (!isSelectionMode) {
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                    {/* Selection Checkbox */}
                                    <div className={`overflow-hidden transition-all duration-300 flex items-center justify-center ${isSelectionMode ? 'w-5 opacity-100' : 'w-0 opacity-0'
                                        }`}>
                                        <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-400'
                                            }`}>
                                            {isSelected && <span className="text-white text-[10px]">✓</span>}
                                        </div>
                                    </div>

                                    {/* ✅ FIX: Moved the deleted message UI inside the main wrapper so it's selectable */}
                                    {msg.isDeletedForEveryone ? (
                                        <div className={`max-w-[75%] px-4 py-2 shadow-sm rounded-2xl bg-travel-card border border-travel-border text-travel-text-muted italic text-sm transition-transform ${isSelected ? 'scale-95' : 'scale-100'}`}>
                                            🚫 This message was deleted
                                        </div>
                                    ) : (
                                        <div className={`max-w-[80%] px-4 py-2 shadow-sm relative transition-transform ${isSelected ? 'scale-95' : 'scale-100'
                                            } ${isMe
                                                ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
                                                : 'bg-travel-card text-travel-text border border-travel-border rounded-2xl rounded-tl-sm'
                                            }`}>
                                            {!isMe && activeChat.type === "GROUP" && (
                                                <p className="text-[10px] font-bold text-blue-400 mb-0.5">
                                                    {msg.sender.name}
                                                </p>
                                            )}

                                            <p
                                                className="text-sm wrap-break-word"
                                                dangerouslySetInnerHTML={{
                                                    __html: DOMPurify.sanitize(msg.content)
                                                }}
                                            />

                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <span className={`text-[10px] ${isMe ? 'text-blue-200' : 'text-travel-text-muted'
                                                    }`}>
                                                    {formatLocalTime(msg.createdAt)}
                                                </span>

                                                {isMe && !isSelectionMode && (
                                                    <span className="text-xs">
                                                        {msg.status === "PENDING" && <span className="text-blue-200">🕒</span>}
                                                        {msg.status === "SENT" && <span className="text-blue-200">✓</span>}
                                                        {msg.status === "DELIVERED" && <span className="text-blue-200">✓✓</span>}
                                                        {msg.status === "READ" && <span className="text-white font-bold">✓✓</span>}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                )}
                <div ref={messagesEndRef} />
            </div>

            {typingUsers.length > 0 && !isSelectionMode && (
                <div className="px-4 py-1 bg-travel-card/50 text-xs text-travel-text-muted italic shrink-0">
                    {typingUsers.map(u => u.name).join(", ")} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </div>
            )}

            {showScrollDown && (
                <button
                    onClick={handleScrollToBottom}
                    className="absolute right-4 bottom-20 z-50 w-10 h-10 bg-travel-card dark:bg-gray-800 border border-travel-border rounded-full shadow-lg flex items-center justify-center text-travel-text-muted hover:text-blue-500 transition-all"
                    aria-label="Scroll to bottom"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </button>
            )}

            {!isSelectionMode && (
                <div className="flex-none p-3 bg-travel-card border-t border-travel-border w-full">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            placeholder="Type a message..."
                            maxLength={5000}
                            className="flex-1 px-4 py-2 rounded-full border border-travel-border bg-travel-bg text-travel-text focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim()}
                            className="bg-blue-600 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition-colors"
                            aria-label="Send message"
                            title="Send message"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}