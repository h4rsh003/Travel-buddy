import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Conversation } from "../entities/Conversation";
import { Message } from "../entities/Message";
import { In } from "typeorm";

export class ChatController {

    static async getMyConversations(req: Request, res: Response): Promise<any> {
        try {
            const userId = req.body.user.userId;
            const conversationRepo = AppDataSource.getRepository(Conversation);

            const userConversations = await conversationRepo.find({
                where: {
                    participants: { id: userId }
                },
                select: ["id"]
            });

            if (userConversations.length === 0) {
                return res.status(200).json([]);
            }

            const conversationIds = userConversations.map(c => c.id);

            const conversations = await conversationRepo.find({
                where: {
                    id: In(conversationIds)
                },
                relations: ["participants", "trip"],
                order: { lastMessageAt: "DESC" }
            });

            return res.status(200).json(conversations);
        } catch (error) {
            console.error("GET CONVERSATIONS ERROR:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }

    static async getMessages(req: Request, res: Response): Promise<any> {
        try {
            const { userId } = req.body.user;
            const { conversationId } = req.params;
            const { limit = 50, before } = req.query;

            const conversationRepo = AppDataSource.getRepository(Conversation);
            const messageRepo = AppDataSource.getRepository(Message);

            const conversation = await conversationRepo.findOne({
                where: { id: Number(conversationId), participants: { id: userId } }
            });

            if (!conversation) {
                return res.status(403).json({ message: "Access denied or conversation not found" });
            }

            const queryBuilder = messageRepo
                .createQueryBuilder("message")
                .leftJoinAndSelect("message.sender", "sender")
                .where("message.conversationId = :conversationId", {
                    conversationId: Number(conversationId)
                })
                .orderBy("message.createdAt", "DESC")
                .limit(Number(limit));

            if (before) {
                queryBuilder.andWhere("message.createdAt < :before", { before });
            }

            const messages = await queryBuilder.getMany();

            return res.status(200).json(messages.reverse());
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }

    static async sendMessage(req: Request, res: Response): Promise<any> {
        try {
            const { userId } = req.body.user;
            const { conversationId } = req.params;
            const { content } = req.body;

            if (!content || content.trim() === "") {
                return res.status(400).json({ message: "Message content cannot be empty" });
            }

            if (content.length > 5000) {
                return res.status(400).json({ message: "Message too long (max 5000 characters)" });
            }

            const conversationRepo = AppDataSource.getRepository(Conversation);
            const messageRepo = AppDataSource.getRepository(Message);

            const conversationExists = await conversationRepo.findOne({
                where: { id: Number(conversationId), participants: { id: userId } },
                select: ["id", "isActive"]
            });

            if (!conversationExists) {
                return res.status(403).json({ message: "Access denied" });
            }
            if (conversationExists.isActive === false) {
                return res.status(403).json({ message: "This conversation is frozen. You cannot send messages." });
            }

            const sanitizedContent = content.trim();

            const newMessage = messageRepo.create({
                content: sanitizedContent,
                sender: { id: userId },
                conversation: { id: Number(conversationId) },
                status: "SENT"
            });

            await messageRepo.save(newMessage);
            await conversationRepo.update(Number(conversationId), {
                lastMessageAt: new Date()
            });

            const savedMessage = await messageRepo.findOne({
                where: { id: newMessage.id },
                relations: ["sender"]
            });

            return res.status(201).json(savedMessage);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }

    static async deleteMessage(req: Request, res: Response): Promise<any> {
        try {
            const { userId } = req.body.user;
            const { conversationId, messageId } = req.params;
            const { type } = req.body;

            const messageRepo = AppDataSource.getRepository(Message);

            const message = await messageRepo.findOne({
                where: {
                    id: Number(messageId),
                    conversation: { id: Number(conversationId) }
                },
                relations: ["sender"]
            });

            if (!message) {
                return res.status(404).json({ message: "Message not found" });
            }

            if (type === "EVERYONE") {
                if (message.sender.id !== userId) {
                    return res.status(403).json({
                        message: "You can only delete your own messages for everyone."
                    });
                }

                message.isDeletedForEveryone = true;
                message.content = "🚫 This message was deleted";
                await messageRepo.save(message);

                const io = req.app.get("socketio");
                if (io) {
                    io.to(`room_${conversationId}`).emit("message_deleted", {
                        messageId: Number(messageId)
                    });
                }

            } else if (type === "ME") {
                const currentDeletedBy = message.deletedBy || [];

                if (!currentDeletedBy.includes(userId)) {
                    message.deletedBy = [...currentDeletedBy, userId];
                    await messageRepo.save(message);
                }
            } else {
                return res.status(400).json({ message: "Invalid delete type." });
            }

            return res.status(200).json(message);
        } catch (error) {
            console.error("Delete Message Error:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }

    static async clearConversation(req: Request, res: Response): Promise<any> {
        try {
            const { userId } = req.body.user;
            const { conversationId } = req.params;

            const messageRepo = AppDataSource.getRepository(Message);

            // Fetch all messages in this conversation where the user hasn't already deleted them
            const messages = await messageRepo
                .createQueryBuilder("message")
                .where("message.conversationId = :conversationId", { conversationId: Number(conversationId) })
                .getMany();

            if (messages.length === 0) {
                return res.status(200).json({ message: "Conversation already clear" });
            }

            // Update all messages to include this user in deletedBy
            const updatedMessages = messages.map(msg => {
                const currentDeletedBy = msg.deletedBy || [];
                if (!currentDeletedBy.includes(userId)) {
                    msg.deletedBy = [...currentDeletedBy, userId];
                }
                return msg;
            });

            await messageRepo.save(updatedMessages);

            return res.status(200).json({ message: "Conversation cleared successfully" });
        } catch (error) {
            console.error("Clear Conversation Error:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
}