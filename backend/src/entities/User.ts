import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Trip } from "./Trip";
import { JoinRequest } from "./JoinRequest";
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true }) 
  password: string;
  
  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  profile_image: string;

  @Column("simple-array", { nullable: true })
  interests: string[];

  @CreateDateColumn()
  created_at: Date;

  // RELATIONSHIP: One User has Many Trips
  @OneToMany(() => Trip, (trip) => trip.user)
  trips: Trip[];

  @OneToMany(() => JoinRequest, (request) => request.user)
  joinRequests: JoinRequest[];
}