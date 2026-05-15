import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    JoinTable,
    OneToMany,
    ManyToOne
} from "typeorm";
import { User } from "./User";
import { Message } from "./Message";
import { Trip } from "./Trip";

@Entity()
export class Conversation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "enum", enum: ["DIRECT", "GROUP"], default: "DIRECT" })
    type: "DIRECT" | "GROUP";

    @Column({ nullable: true })
    name: string;

    @ManyToOne(() => Trip, trip => trip.conversations, { nullable: true, onDelete: "CASCADE" })
    trip: Trip;

    @ManyToOne(() => User, { nullable: true })
    admin: User;

    @ManyToMany(() => User, user => user.conversations)
    @JoinTable({ name: "conversation_participants" })
    participants: User[];

    @OneToMany(() => Message, message => message.conversation)
    messages: Message[];

    // Used to sort the inbox by most recent activity!
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    lastMessageAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}