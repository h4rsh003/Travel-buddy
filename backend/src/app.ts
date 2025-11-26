import express from "express";
import "reflect-metadata";
import { AppDataSource } from "./config/data-source";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Travel Buddy Backend is Running! 🚀");
});

// Initialize Database
AppDataSource.initialize()
  .then(() => {
    console.log("✅ Database Connected Successfully to Neon.tech!");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Database Connection Error:", error);
  });