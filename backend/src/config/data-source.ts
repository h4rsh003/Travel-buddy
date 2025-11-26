import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true, // ⚠️ Auto-creates tables (only for development!)
  logging: false,
  entities: ["src/entities/**/*.ts"], 
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
  ssl: true, // ⚠️ Mandatory for Neon.tech
});