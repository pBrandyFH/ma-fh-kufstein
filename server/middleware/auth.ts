import type { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import type { UserRole } from "../types";

let JWT_SECRET: string;

// Initialize JWT secret
export const initializeAuth = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  JWT_SECRET = process.env.JWT_SECRET;
};

interface DecodedToken {
  id: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

// Middleware to verify JWT token
export const auth = (req: Request, res: Response, next: NextFunction) => {
  // Get token from header
  const authHeader = req.header("Authorization");
  console.log("Auth header:", authHeader); // Debug log

  if (!authHeader) {
    console.log("No Authorization header found"); // Debug log
    return res.status(401).json({
      success: false,
      error: "No token, authorization denied",
    });
  }

  // Extract token from Bearer string
  const token = authHeader.replace("Bearer ", "");
  console.log("Extracted token:", token); // Debug log

  try {
    // Verify token
    console.log("Verifying token with secret:", JWT_SECRET); // Debug log
    const decoded = verify(token, JWT_SECRET) as DecodedToken;
    console.log("Decoded token:", decoded); // Debug log

    // Add user from payload to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error); // Debug log
    res.status(401).json({
      success: false,
      error: "Token is not valid",
    });
  }
};

// Middleware to check user role
export const authorize = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      console.log("No user found in request"); // Debug log
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    console.log("User role:", req.user.role); // Debug log
    console.log("Required roles:", roles); // Debug log

    if (!roles.includes(req.user.role)) {
      console.log("User role not authorized"); // Debug log
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this resource",
      });
    }

    next();
  };
};
