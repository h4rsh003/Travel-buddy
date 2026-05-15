import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { JoinRequest, RequestStatus } from "../entities/JoinRequest";
import { Trip } from "../entities/Trip";
import { Conversation } from "../entities/Conversation";
import { User } from "../entities/User";

export class RequestController {

  static async sendRequest(req: Request, res: Response): Promise<any> {
    try {
      const { userId } = req.body.user;
      const { tripId } = req.body;

      const requestRepo = AppDataSource.getRepository(JoinRequest);
      const tripRepo = AppDataSource.getRepository(Trip);

      // 1. Check if Trip exists
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

      // Validate status
      if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const requestRepo = AppDataSource.getRepository(JoinRequest);

      const conversationRepo = AppDataSource.getRepository(Conversation);
      const userRepo = AppDataSource.getRepository(User);

      const request = await requestRepo.findOne({
        where: { id: Number(requestId) },
        relations: ["trip", "trip.user"]
      });

      if (!request) return res.status(404).json({ message: "Request not found" });

      if (request.trip.user.id !== userId) {
        return res.status(403).json({ message: "You are not the owner of this trip" });
      }

      // Update Status
      request.status = status as RequestStatus;
      await requestRepo.save(request);

      if (status === "accepted") {
        const guestUser = await userRepo.findOne({ where: { id: request.userId } });

        if (guestUser) {
          const newConversation = conversationRepo.create({
            type: "DIRECT",
            trip: request.trip,
            participants: [guestUser, request.trip.user] // [Guest, Host]
          });
          await conversationRepo.save(newConversation);
        }
      }

      return res.status(200).json({ message: `Request ${status} successfully!` });

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
      const request = await requestRepo.findOne({
        where: { userId, tripId: Number(tripId) }
      });

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

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