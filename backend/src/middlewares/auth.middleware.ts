import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction): any => {
  // 1. Get Token from Header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  // 🛑 LOG 1: What did the backend actually receive?
  console.log("------------------------------------------------");
  console.log("🔍 MIDDLEWARE DEBUG:");
  console.log("🔑 Token Received:", token);
  
  // 🛑 LOG 2: What secret is the backend using?
  console.log("🔐 Secret Used:", process.env.JWT_SECRET || "secret");

  if (!token) {
    console.log("❌ No token found in header");
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

try {
    // 2. Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    
    console.log("✅ Token Verified! User ID:", (decoded as any).userId);
    console.log("------------------------------------------------");

    // 🛠️ FIX: Initialize req.body if it doesn't exist (because GET requests are empty)
    if (!req.body) {
        req.body = {};
    }
    
    req.body.user = decoded; // Now this works safely!
    
    next(); 
  } catch (error) {
    // 🛑 LOG 3: Why did it fail?
    console.log("❌ JWT Error:", error);
    console.log("------------------------------------------------");
    
    res.status(400).json({ message: "Invalid Token" });
  }
};