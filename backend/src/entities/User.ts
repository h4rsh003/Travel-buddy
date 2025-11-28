import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

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
  
  // 👇 NEW COLUMNS
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
}