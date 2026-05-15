import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne
} from "typeorm";
import { User } from "./User";
import { Conversation } from "./Conversation";

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("text")
    content: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    sender: User;

    @ManyToOne(() => Conversation, conversation => conversation.messages, { onDelete: "CASCADE" })
    conversation: Conversation;

    // For WhatsApp-style read receipts
    @Column({ type: "enum", enum: ["SENT", "DELIVERED", "READ"], default: "SENT" })
    status: "SENT" | "DELIVERED" | "READ";

    // e.g., "Harsh joined the chat"
    @Column({ default: false })
    isSystemMessage: boolean;

    // "Delete for Everyone"
    @Column({ default: false })
    isDeletedForEveryone: boolean;

    @Column("int", { array: true, default: [] })
    deletedBy: number[];

    @CreateDateColumn({ type: "timestamptz" })
    createdAt: Date;
}