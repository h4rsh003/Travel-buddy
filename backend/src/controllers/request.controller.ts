import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { JoinRequest, RequestStatus } from "../entities/JoinRequest";
import { Trip } from "../entities/Trip";
import { Conversation } from "../entities/Conversation";
import { User } from "../entities/User";
import { Message } from "../entities/Message";

export class RequestController {

  static async sendRequest(req: Request, res: Response): Promise<any> {
    try {
      const { userId } = req.body.user;
      const { tripId } = req.body;

      const requestRepo = AppDataSource.getRepository(JoinRequest);
      const tripRepo = AppDataSource.getRepository(Trip);

      const trip = await tripRepo.findOne({ where: { id: tripId }, relations: ["user"] });
      if (!trip) return res.status(404).json({ message: "Trip not found" });

      if (trip.user.id === userId) {
        return res.status(400).json({ message: "You cannot join your own trip!" });
      }

      const existingRequest = await requestRepo.findOne({
        where: { userId, tripId }
      });
      if (existingRequest) {
        return res.status(409).json({ message: "You have already requested to join this trip." });
      }

      const newRequest = new JoinRequest();
      newRequest.userId = userId;
      newRequest.trip = trip;
      newRequest.status = RequestStatus.PENDING;

      await requestRepo.save(newRequest);

      return res.status(201).json({ message: "Request sent successfully!", request: newRequest });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async handleRequestStatus(req: Request, res: Response): Promise<any> {
    try {
      const { userId } = req.body.user;
      const { requestId, status } = req.params;

      // Validate status (handling both upper and lower case safely)
      const normalizedStatus = status.toLowerCase();
      if (!["accepted", "rejected"].includes(normalizedStatus)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const requestRepo = AppDataSource.getRepository(JoinRequest);
      const conversationRepo = AppDataSource.getRepository(Conversation);
      const userRepo = AppDataSource.getRepository(User);
      const messageRepo = AppDataSource.getRepository(Message);

      const request = await requestRepo.findOne({
        where: { id: Number(requestId) },
        relations: ["trip", "trip.user"]
      });

      if (!request) return res.status(404).json({ message: "Request not found" });

      if (request.trip.user.id !== userId) {
        return res.status(403).json({ message: "You are not the owner of this trip" });
      }

      // Update Status
      request.status = normalizedStatus === "accepted" ? RequestStatus.ACCEPTED : RequestStatus.REJECTED;
      await requestRepo.save(request);

      if (normalizedStatus === "accepted") {
        const guestUser = await userRepo.findOne({ where: { id: request.userId } });

        if (guestUser) {
          const existingConversation = await conversationRepo
            .createQueryBuilder("conversation")
            .innerJoin("conversation.participants", "p1", "p1.id = :hostId", { hostId: request.trip.user.id })
            .innerJoin("conversation.participants", "p2", "p2.id = :guestId", { guestId: guestUser.id })
            .where("conversation.tripId = :tripId", { tripId: request.trip.id })
            .getOne();

          if (!existingConversation) {
            const newConversation = conversationRepo.create({
              type: "DIRECT",
              trip: request.trip,
              participants: [guestUser, request.trip.user], // [Guest, Host]
              isActive: true
            });
            await conversationRepo.save(newConversation);
          } else if (existingConversation.isActive === false) {

            existingConversation.isActive = true;
            await conversationRepo.save(existingConversation);

            const systemMessage = messageRepo.create({
              content: `${guestUser.name} has rejoined the trip.`,
              isSystemMessage: true,
              conversation: { id: existingConversation.id },
              sender: { id: guestUser.id },
              status: "READ"
            });
            const savedSysMsg = await messageRepo.save(systemMessage);

            const io = req.app.get("socketio");
            if (io) {
              const roomName = `room_${existingConversation.id}`;
              io.to(roomName).emit("receive_message", savedSysMsg);
              io.to(roomName).emit("chat_unfrozen", { conversationId: existingConversation.id });
            }
          }
        }
      }

      return res.status(200).json({ message: `Request ${normalizedStatus} successfully!` });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async cancelRequest(req: Request, res: Response): Promise<any> {
    try {
      const { userId } = req.body.user;
      const { tripId } = req.params;

      const requestRepo = AppDataSource.getRepository(JoinRequest);
      const conversationRepo = AppDataSource.getRepository(Conversation);
      const messageRepo = AppDataSource.getRepository(Message);
      const userRepo = AppDataSource.getRepository(User);
      const currentUser = await userRepo.findOne({ where: { id: userId } });

      const request = await requestRepo.findOne({
        where: { userId, tripId: Number(tripId) },
        relations: ["trip", "trip.user"]
      });

      if (!request || !currentUser) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (request.status === RequestStatus.ACCEPTED) {

        const conversation = await conversationRepo
          .createQueryBuilder("conversation")
          .innerJoin("conversation.participants", "p1", "p1.id = :hostId", { hostId: request.trip.user.id })
          .innerJoin("conversation.participants", "p2", "p2.id = :guestId", { guestId: userId })
          .where("conversation.tripId = :tripId", { tripId: request.trip.id })
          .getOne();

        if (conversation) {

          conversation.isActive = false;
          await conversationRepo.save(conversation);

          const systemMessage = messageRepo.create({
            content: `${currentUser.name} has left the trip.`,
            isSystemMessage: true,
            conversation: { id: conversation.id },
            sender: { id: userId },
            status: "READ"
          });
          const savedSysMsg = await messageRepo.save(systemMessage);

          const io = req.app.get("socketio");
          if (io) {
            const roomName = `room_${conversation.id}`;

            io.to(roomName).emit("receive_message", savedSysMsg);

            io.to(roomName).emit("chat_frozen", { conversationId: conversation.id });
          }
        }
      }

      // Finally, delete the request from the DB
      await requestRepo.remove(request);

      return res.status(200).json({ message: "Request withdrawn successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async getMyRequests(req: Request, res: Response): Promise<any> {
    try {
      const { userId } = req.body.user;

      const requestRepo = AppDataSource.getRepository(JoinRequest);

      const requests = await requestRepo.find({
        where: { userId: userId },
        relations: ["trip", "trip.user"],
        order: { id: "DESC" }
      });

      return res.status(200).json(requests);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}