import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction): any => {
  // Get Token from Header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  console.log("------------------------------------------------");
  console.log("MIDDLEWARE DEBUG:");
  console.log("Token Received:", token);
  
  console.log("Secret Used:", process.env.JWT_SECRET || "secret");

  if (!token) {
    console.log("No token found in header");
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    
    console.log("Token Verified! User ID:", (decoded as any).userId);
    console.log("------------------------------------------------");

    if (!req.body) {
        req.body = {};
    }
    
    req.body.user = decoded; 
    next(); 
  } catch (error) {
    console.log(" JWT Error:", error);
    console.log("------------------------------------------------");
    
    res.status(401).json({ message: "Invalid Token" });
  }
};