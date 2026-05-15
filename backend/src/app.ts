import express from "express";
import http from "http";
import { Server } from "socket.io";
import "reflect-metadata";
import { AppDataSource } from "./config/data-source";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import tripRoutes from "./routes/trip.routes";
import requestRoutes from "./routes/request.routes";
import chatRoutes from "./routes/chat.routes";
import cors from "cors";
import jwt from "jsonwebtoken";
import { Message } from "./entities/Message";

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

export const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

app.set("socketio", io);

app.use("/api/requests", requestRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/conversations", chatRoutes);

app.get("/", (req, res) => {
  res.send("Travel Buddy Backend is Running!");
});

app.get("/ping", (req, res) => {
  res.status(200).send("Pong");
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    console.log("❌ Socket connection rejected: No token");
    return next(new Error("Authentication required"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any;
    socket.data.userId = decoded.userId;
    console.log(`Socket authenticated for user: ${decoded.userId}`);
    next();
  } catch (err) {
    console.log("❌ Socket connection rejected: Invalid token");
    return next(new Error("Invalid token"));
  }
});

// 3. WebSocket Event Listeners
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id} (User ID: ${socket.data.userId})`);

  // Join conversation room
  socket.on("join_room", (conversationId: number) => {
    const roomName = `room_${conversationId}`;
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined ${roomName}`);
  });

  // Send message
  socket.on("send_message", (data: { conversationId: number; message: any }) => {
    const roomName = `room_${data.conversationId}`;
    socket.to(roomName).emit("receive_message", data.message);
    console.log(`Message sent to ${roomName}`);
  });

  // Delete message
  socket.on("delete_message", (data: { conversationId: number; messageId: number }) => {
    const roomName = `room_${data.conversationId}`;
    socket.to(roomName).emit("message_deleted", {
      messageId: data.messageId
    });
    console.log(`Message ${data.messageId} deleted in ${roomName}`);
  });

  socket.on("typing", (data: { conversationId: number; userName: string }) => {
    const roomName = `room_${data.conversationId}`;
    socket.to(roomName).emit("user_typing", {
      userId: socket.data.userId,
      userName: data.userName
    });
  });

  socket.on("stop_typing", (data: { conversationId: number }) => {
    const roomName = `room_${data.conversationId}`;
    socket.to(roomName).emit("user_stopped_typing", {
      userId: socket.data.userId
    });
  });

  socket.on("mark_as_read", async (data: { conversationId: number; messageIds: number[] }) => {
    try {
      const messageRepo = AppDataSource.getRepository(Message);

      await messageRepo
        .createQueryBuilder()
        .update(Message)
        .set({ status: "READ" })
        .where("id IN (:...ids)", { ids: data.messageIds })
        .andWhere("conversation.id = :conversationId", { conversationId: data.conversationId })
        .execute();

      const roomName = `room_${data.conversationId}`;
      socket.to(roomName).emit("messages_read", {
        messageIds: data.messageIds,
        readBy: socket.data.userId
      });

      console.log(`Messages marked as read in conversation ${data.conversationId}`);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

AppDataSource.initialize()
  .then(() => {
    console.log("Database Connected Successfully to Neon.tech!");

    server.listen(PORT, () => {
      console.log(`Server & WebSockets running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database Connection Error:", error);
  });