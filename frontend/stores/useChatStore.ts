import { axiosAuth } from '@/libs/axios';
import { socket } from '@/libs/socket';
import { create } from 'zustand';
import { isAxiosError } from 'axios';

export interface ChatUser {
    id: number;
    name: string;
    avatar?: string;
}

export interface ChatTrip {
    id: number;
    destination: {
        name: string;
        formattedAddress?: string;
        lat?: number;
        lon?: number;
        country?: string;
    };
    title?: string;
    startDate?: string;
}

export interface Message {
    id: number | string;
    content: string;
    sender: ChatUser;
    status: "SENT" | "DELIVERED" | "READ" | "PENDING";
    createdAt: string;
    isDeletedForEveryone?: boolean;
    deletedBy?: number[];
}

export interface Conversation {
    id: number;
    type: "DIRECT" | "GROUP";
    participants: ChatUser[];
    lastMessageAt: string;
    trip?: ChatTrip;
}

interface ChatStore {
    conversations: Conversation[];
    activeConversationId: number | null;
    messages: Message[];
    isLoadingInbox: boolean;
    isLoadingMessages: boolean;
    hasMoreMessages: boolean;
    oldestMessageDate: string | null;

    fetchConversations: () => Promise<void>;
    setActiveConversation: (id: number | null) => void;
    fetchMessages: (conversationId: number, before?: string) => Promise<void>;
    loadMoreMessages: (conversationId: number) => Promise<void>;
    sendMessage: (conversationId: number, content: string, currentUser: ChatUser) => Promise<void>;
    addMessage: (message: Message) => void;
    deleteMessage: (conversationId: number, messageId: number | string, type: "ME" | "EVERYONE", myUserId: number) => Promise<void>;
    setMessagesDeleted: (messageId: number, type?: "ME" | "EVERYONE") => void;
    updateMessageStatus: (messageIds: (number | string)[], status: "READ" | "DELIVERED") => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    conversations: [],
    activeConversationId: null,
    messages: [],
    isLoadingInbox: false,
    isLoadingMessages: false,
    hasMoreMessages: true,
    oldestMessageDate: null,

    fetchConversations: async () => {
        set({ isLoadingInbox: true });
        try {
            const response = await axiosAuth.get("/api/conversations");
            set({ conversations: response.data, isLoadingInbox: false });
        } catch (error) {
            console.error("Failed to fetch conversations:", error);
            set({ isLoadingInbox: false });
        }
    },

    setActiveConversation: (id) => {
        set({
            activeConversationId: id,
            messages: [],
            hasMoreMessages: true,
            oldestMessageDate: null
        });

        if (id) {
            get().fetchMessages(id);
        }
    },

    fetchMessages: async (conversationId, before?) => {
        set({ isLoadingMessages: true });
        try {
            const url = before
                ? `/api/conversations/${conversationId}/messages?limit=50&before=${before}`
                : `/api/conversations/${conversationId}/messages?limit=50`;

            const response = await axiosAuth.get(url);
            const newMessages = response.data;

            if (newMessages.length < 50) {
                set({ hasMoreMessages: false });
            }

            if (before) {
                set((state) => ({
                    messages: [...newMessages, ...state.messages],
                    oldestMessageDate: newMessages[0]?.createdAt || state.oldestMessageDate,
                    isLoadingMessages: false
                }));
            } else {
                set({
                    messages: newMessages,
                    oldestMessageDate: newMessages[0]?.createdAt || null,
                    isLoadingMessages: false
                });
            }
        } catch (error) {
            console.error("Failed to fetch messages:", error);
            set({ isLoadingMessages: false });
        }
    },

    loadMoreMessages: async (conversationId) => {
        const { hasMoreMessages, oldestMessageDate, isLoadingMessages } = get();
        if (!hasMoreMessages || isLoadingMessages || !oldestMessageDate) return;
        await get().fetchMessages(conversationId, oldestMessageDate);
    },

    addMessage: (message) => set((state) => {
        if (state.messages.some(m => String(m.id) === String(message.id))) return state;
        return { messages: [...state.messages, message] };
    }),

    sendMessage: async (conversationId, content, currentUser) => {
        const tempId = `temp-${Date.now()}`;
        const optimisticMessage: Message = {
            id: tempId,
            content,
            sender: currentUser,
            status: "PENDING",
            createdAt: new Date().toISOString(),
            deletedBy: [],
            isDeletedForEveryone: false
        };

        set((state) => ({ messages: [...state.messages, optimisticMessage] }));

        try {
            const response = await axiosAuth.post(
                `/api/conversations/${conversationId}/messages`,
                { content }
            );
            const savedMessage = response.data;

            set((state) => ({
                messages: state.messages.map((msg) =>
                    msg.id === tempId
                        ? { ...savedMessage, createdAt: msg.createdAt }
                        : msg
                )
            }));

            socket.emit("send_message", {
                conversationId,
                message: savedMessage
            });

            get().fetchConversations();
        } catch (error) {
            console.error("Failed to send message:", error);
            set((state) => ({
                messages: state.messages.filter(msg => msg.id !== tempId)
            }));

            if (isAxiosError(error)) {
                alert(error.response?.data?.message || "Failed to send message");
            } else {
                alert("Failed to send message");
            }
        }
    },

    deleteMessage: async (conversationId, messageId, type, myUserId) => {
        const previousMessages = get().messages;

        // Optimistic UI Update
        set((state) => ({
            messages: state.messages.map((msg) => {
                if (String(msg.id) === String(messageId)) {
                    if (type === "EVERYONE") {
                        return {
                            ...msg,
                            isDeletedForEveryone: true,
                            content: "🚫 This message was deleted"
                        };
                    } else {
                        return {
                            ...msg,
                            deletedBy: [...(msg.deletedBy || []), myUserId]
                        };
                    }
                }
                return msg;
            })
        }));

        try {
            await axiosAuth.delete(
                `/api/conversations/${conversationId}/messages/${messageId}`,
                { data: { type } }
            );

            if (type === "EVERYONE") {
                socket.emit("delete_message", { conversationId, messageId });
            }
        } catch (error) {
            console.error("Failed to delete message", error);
            set({ messages: previousMessages });

            if (isAxiosError(error)) {
                alert(error.response?.data?.message || "Failed to delete message");
            } else {
                alert("Failed to delete message");
            }
        }
    },

    setMessagesDeleted: (messageId) => {
        set((state) => ({
            messages: state.messages.map(m =>
                String(m.id) === String(messageId)
                    ? { ...m, isDeletedForEveryone: true, content: "🚫 This message was deleted" }
                    : m
            )
        }));
    },

    updateMessageStatus: (messageIds, status) => {
        set((state) => ({
            messages: state.messages.map(msg =>
                messageIds.some(id => String(id) === String(msg.id))
                    ? { ...msg, status }
                    : msg
            )
        }));
    }
}));