import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./User";
import { JoinRequest } from "./JoinRequest";

@Entity()
export class Trip {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  destination: string;

  @Column()
  startDate: string; // Storing as YYYY-MM-DD string is easiest for now

  @Column()
  endDate: string;

  @Column()
  budget: number;

  @Column("text")
  description: string;

  // 🔗 RELATIONSHIP: Many Trips belong to One User
  @ManyToOne(() => User, (user) => user.trips)
  @JoinColumn({ name: "userId" }) // This creates a "userId" column in the database
  user: User;

  @Column()
  userId: number; // We explicitly add this so we can access trip.userId easily

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => JoinRequest, (request) => request.trip)
  joinRequests: JoinRequest[];
}