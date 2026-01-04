import express from "express";
import "reflect-metadata";
import { AppDataSource } from "./config/data-source";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import tripRoutes from "./routes/trip.routes";
import requestRoutes from "./routes/request.routes";

import cors from "cors";
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());

app.use(express.json());

app.use("/api/requests", requestRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
  res.send("Travel Buddy Backend is Running!");
});
// Health Check Route
app.get("/ping", (req, res) => {
  res.status(200).send("Pong");
});

// Initialize Database
AppDataSource.initialize()
  .then(() => {
    console.log("Database Connected Successfully to Neon.tech!");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database Connection Error:", error);
  });