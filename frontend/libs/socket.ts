import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const socket: Socket = io(SOCKET_URL, {
    autoConnect: false, // Don't connect immediately
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

export const connectSocket = (token: string) => {
    socket.auth = { token };

    if (!socket.connected) {
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};

socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
});

socket.on("reconnect_attempt", (attemptNumber) => {
    console.log(`Reconnection attempt ${attemptNumber}...`);
});

socket.on("reconnect", (attemptNumber) => {
    console.log(`Reconnected after ${attemptNumber} attempts`);
});

socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);

    if (reason === "io server disconnect") {
        socket.connect();
    }
});