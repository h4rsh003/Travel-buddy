import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Conversation } from "../entities/Conversation";
import { Message } from "../entities/Message";

export class ChatController {

    static async getMyConversations(req: Request, res: Response): Promise<any> {
        try {
            const userId = req.body.user.userId;
            const conversationRepo = AppDataSource.getRepository(Conversation);

            const conversations = await conversationRepo.find({
                where: {
                    participants: { id: userId }
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

            // Security Check
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

            // If 'before' timestamp is provided, fetch older messages
            if (before) {
                queryBuilder.andWhere("message.createdAt < :before", { before });
            }

            const messages = await queryBuilder.getMany();

            // Return in ascending order (oldest first)
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

            // Security Check
            const conversation = await conversationRepo.findOne({
                where: { id: Number(conversationId), participants: { id: userId } }
            });

            if (!conversation) {
                return res.status(403).json({ message: "Access denied" });
            }

            const sanitizedContent = content.trim();

            const newMessage = messageRepo.create({
                content: sanitizedContent,
                sender: { id: userId },
                conversation: { id: Number(conversationId) },
                status: "SENT"
            });

            await messageRepo.save(newMessage);

            conversation.lastMessageAt = new Date();
            await conversationRepo.save(conversation);

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

            // Fetch the message
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
                if (!message.deletedBy) {
                    message.deletedBy = [];
                }

                if (!message.deletedBy.includes(userId)) {
                    message.deletedBy.push(userId);
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
}