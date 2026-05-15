import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./User";
import { JoinRequest } from "./JoinRequest";
import { Conversation } from "./Conversation";

@Entity()
export class Trip {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "jsonb" })
  destination: {
    name: string;
    country: string;
    formattedAddress: string;
    lat: number;
    lon: number;
  };

  @Column()
  startDate: string;

  @Column()
  endDate: string;

  @Column()
  budget: number;

  @Column("text")
  description: string;

  // 🔗 RELATIONSHIP: Many Trips belong to One User
  @ManyToOne(() => User, (user) => user.trips)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  userId: number;
  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => JoinRequest, (request) => request.trip)
  joinRequests: JoinRequest[];

  @OneToMany(() => Conversation, conversation => conversation.trip)
  conversations: Conversation[];
}