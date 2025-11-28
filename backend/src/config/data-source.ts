import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true, 
  logging: false,
  // 👇 FIX: Dynamically select .ts (dev) or .js (prod)
  entities: [
    process.env.NODE_ENV === "production" 
      ? "dist/entities/**/*.js" 
      : "src/entities/**/*.ts"
  ],
  migrations: [
    process.env.NODE_ENV === "production"
      ? "dist/migrations/**/*.js"
      : "src/migrations/**/*.ts"
  ],
  subscribers: [],
  ssl: true, // Keep this for Neon.tech
});