"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useChatStore, Message } from "@/stores/useChatStore";
import { socket, connectSocket } from "@/libs/socket";
import DOMPurify from "isomorphic-dompurify";

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

export default function ChatWindow() {
    const { data: session } = useSession();
    const myUserId = Number(session?.user?.id);

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
        setActiveConversation,
        addMessage,
        deleteMessage,
        loadMoreMessages,
        updateMessageStatus,
        setMessagesDeleted
    } = useChatStore();

    // UI States
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
    const [inputText, setInputText] = useState("");

    // Typing users tracking
    const [typingUsers, setTypingUsers] = useState<{ id: number, name: string }[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const activeChat = conversations.find(c => c.id === activeConversationId);
    const otherUser = activeChat?.participants.find(p => p.id !== myUserId) || activeChat?.participants[0];

    // Connect socket with JWT token
    useEffect(() => {
        if (session?.user?.accessToken) {
            connectSocket(session.user.accessToken);
        }
    }, [session]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleScroll = useCallback(() => {
        if (!messagesContainerRef.current || !activeConversationId) return;
        const { scrollTop } = messagesContainerRef.current;

        if (scrollTop < 100 && hasMoreMessages && !isLoadingMessages) {
            loadMoreMessages(activeConversationId);
        }
    }, [activeConversationId, hasMoreMessages, isLoadingMessages, loadMoreMessages]);

    useEffect(() => {
        if (!activeConversationId) return;

        const joinCurrentRoom = () => {
            setIsConnected(true);
            socket.emit("join_room", activeConversationId);
        };

        if (socket.connected) {
            joinCurrentRoom();
        }

        // Event Handlers
        const handleConnect = () => {
            joinCurrentRoom();
        };

        const handleDisconnect = () => setIsConnected(false);
        const handleConnectError = (error: Error) => {
            console.error("Socket connection error:", error);
            setIsConnected(false);
        };

        const handleReceiveMessage = (newMessage: Message) => {
            if (newMessage.sender.id !== myUserId) {
                addMessage(newMessage);

                setTimeout(() => {
                    socket.emit("mark_as_read", {
                        conversationId: activeConversationId,
                        messageIds: [newMessage.id]
                    });
                }, 500);
            }
        };

        const handleMessageDeleted = ({ messageId }: { messageId: number }) => {
            if (setMessagesDeleted) {
                setMessagesDeleted(messageId);
            }
        };

        const handleUserTyping = ({ userId, userName }: { userId: number; userName: string }) => {
            if (userId === myUserId) return;
            setTypingUsers(prev =>
                prev.some(u => u.id === userId) ? prev : [...prev, { id: userId, name: userName }]
            );
        };

        const handleUserStoppedTyping = ({ userId }: { userId: number }) => {
            setTypingUsers(prev => prev.filter(u => u.id !== userId));
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
            msg => msg.sender.id !== myUserId && msg.status !== "READ"
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

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        if (window.confirm(`Delete ${selectedIds.length} message(s)?`)) {
            selectedIds.forEach(id => {
                deleteMessage(activeConversationId!, id as number, "EVERYONE", myUserId);
            });
            cancelSelection();
        }
    };

    // Typing Logic
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);

        socket.emit("typing", {
            conversationId: activeConversationId,
            userName: currentUser.name
        });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stop_typing", {
                conversationId: activeConversationId
            });
        }, 1000);
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !activeConversationId) return;

        socket.emit("stop_typing", { conversationId: activeConversationId });
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        sendMessage(activeConversationId, inputText, currentUser);
        setInputText("");
    };

    if (!activeChat) return null;

    return (
        <div className="flex flex-col h-full w-full bg-travel-bg relative">

            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-travel-card border-b border-travel-border shadow-sm z-30">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => isSelectionMode ? cancelSelection() : setActiveConversation(null)}
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
                        <button
                            onClick={handleBulkDelete}
                            disabled={selectedIds.length === 0}
                            className="flex items-center gap-1.5 text-sm bg-red-600 text-white px-4 py-1.5 rounded-full hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
                        >
                            Delete
                        </button>
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

            {hasMoreMessages && !isLoadingMessages && messages.length >= 50 && (
                <div className="p-2 bg-travel-card/50 text-center">
                    <button
                        onClick={() => loadMoreMessages(activeConversationId!)}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Load older messages
                    </button>
                </div>
            )}

            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-travel-bg"
            >
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
                            const isMe = msg.sender.id === myUserId;
                            const isSelected = selectedIds.includes(msg.id);

                            if (msg.isDeletedForEveryone) {
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className="max-w-[75%] px-4 py-2 shadow-sm rounded-2xl bg-travel-card border border-travel-border text-travel-text-muted italic text-sm">
                                            🚫 This message was deleted
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={msg.id}
                                    className={`flex items-center gap-3 transition-all ${isMe ? 'flex-row-reverse' : 'flex-row'
                                        } ${isSelectionMode ? 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded-lg p-1' : ''
                                        }`}
                                    onClick={() => isSelectionMode && toggleSelection(msg.id)}
                                >
                                    {isSelectionMode && (
                                        <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-400'
                                            }`}>
                                            {isSelected && <span className="text-white text-[10px]">✓</span>}
                                        </div>
                                    )}

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
                                </div>
                            );
                        })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {typingUsers.length > 0 && !isSelectionMode && (
                <div className="px-4 py-1 bg-travel-card/50 text-xs text-travel-text-muted italic">
                    {typingUsers.map(u => u.name).join(", ")} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </div>
            )}

            {/* Input Bar */}
            {!isSelectionMode && (
                <div className="p-3 bg-travel-card border-t border-travel-border">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={handleInputChange}
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