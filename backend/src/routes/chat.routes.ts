import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import rateLimit from "express-rate-limit";

const router = Router();

const messageLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30,
    message: { message: "Too many messages sent. Please slow down." },
    standardHeaders: true,
    legacyHeaders: false,
});

// GET /api/conversations (Fetch the inbox)
router.get("/", authMiddleware, ChatController.getMyConversations);

// GET /api/conversations/:conversationId/messages (Fetch chat history with pagination)
router.get("/:conversationId/messages", authMiddleware, ChatController.getMessages);

// POST /api/conversations/:conversationId/messages (Send a message)
router.post(
    "/:conversationId/messages",
    authMiddleware,
    messageLimiter,
    ChatController.sendMessage
);

// DELETE /api/conversations/:conversationId/messages/:messageId
router.delete("/:conversationId/messages/:messageId", authMiddleware, ChatController.deleteMessage);

export default router;