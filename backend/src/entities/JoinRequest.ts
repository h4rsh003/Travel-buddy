import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm";
import { User } from "./User";
import { Trip } from "./Trip";

export enum RequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected"
}

@Entity()
export class JoinRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "enum",
    enum: RequestStatus,
    default: RequestStatus.PENDING
  })
  status: RequestStatus;

  // 🔗 Relation: Who sent the request?
  @ManyToOne(() => User, (user) => user.joinRequests)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  userId: number;

  // 🔗 Relation: Which trip is it for?
  @ManyToOne(() => Trip, (trip) => trip.joinRequests, { onDelete: "CASCADE" }) // 👈 Added CASCADE
  @JoinColumn({ name: "tripId" })
  trip: Trip;

  @Column()
  tripId: number;

  @CreateDateColumn()
  created_at: Date;
}