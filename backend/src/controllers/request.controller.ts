import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { JoinRequest, RequestStatus } from "../entities/JoinRequest";
import { Trip } from "../entities/Trip";

export class RequestController {
  
  // Send a Join Request
  static async sendRequest(req: Request, res: Response): Promise<any> {
    try {
      const { userId } = req.body.user; // From Middleware (Sender)
      const { tripId } = req.body;      // From Frontend

      const requestRepo = AppDataSource.getRepository(JoinRequest);
      const tripRepo = AppDataSource.getRepository(Trip);

      // 1. Check if Trip exists
      const trip = await tripRepo.findOne({ where: { id: tripId }, relations: ["user"] });
      if (!trip) return res.status(404).json({ message: "Trip not found" });

      // 2. Prevent joining own trip
      if (trip.user.id === userId) {
        return res.status(400).json({ message: "You cannot join your own trip!" });
      }

      // 3. Check for existing request
      const existingRequest = await requestRepo.findOne({
        where: { userId, tripId }
      });
      if (existingRequest) {
        return res.status(409).json({ message: "You have already requested to join this trip." });
      }

      // 4. Create Request
      const newRequest = new JoinRequest();
      newRequest.userId = userId;
      newRequest.trip = trip; // Using the relation object
      newRequest.status = RequestStatus.PENDING;

      await requestRepo.save(newRequest);

      return res.status(201).json({ message: "Request sent successfully!", request: newRequest });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  // Accept or Reject Request
  static async handleRequestStatus(req: Request, res: Response): Promise<any> {
    try {
      const { userId } = req.body.user; // Owner ID
      const { requestId, status } = req.params; // /:requestId/:status

      // Validate status
      if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const requestRepo = AppDataSource.getRepository(JoinRequest);
      
      // Find request and load the Trip relation to check ownership
      const request = await requestRepo.findOne({
        where: { id: Number(requestId) },
        relations: ["trip", "trip.user"]
      });

      if (!request) return res.status(404).json({ message: "Request not found" });

      // Security: Only Trip Owner can accept/reject
      if (request.trip.user.id !== userId) {
        return res.status(403).json({ message: "You are not the owner of this trip" });
      }

      // Update Status
      request.status = status as RequestStatus;
      await requestRepo.save(request);

      return res.status(200).json({ message: `Request ${status} successfully!` });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}