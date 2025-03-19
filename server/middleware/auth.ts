import type { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import type { UserRole } from "../types";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

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
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "No token, authorization denied",
    });
  }

  try {
    // Verify token
    const decoded = verify(token, JWT_SECRET) as DecodedToken;

    // Add user from payload to request
    req.user = decoded;
    next();
  } catch {
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
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this resource",
      });
    }

    next();
  };
};
