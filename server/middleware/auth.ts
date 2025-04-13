import type { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import type { DecodedToken } from "../types";
import User from "../models/User";
import { UserFederationRole } from "../permissions/types";

let JWT_SECRET: string;

// Initialize JWT secret
export const initializeAuth = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  JWT_SECRET = process.env.JWT_SECRET;
};

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

// Middleware to verify JWT token
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  // Get token from header
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: "No token, authorization denied",
    });
  }

  // Extract token from Bearer string
  const token = authHeader.replace("Bearer ", "");

  try {
    // Verify token
    const decoded = verify(token, JWT_SECRET) as DecodedToken;

    // Fetch user to get federationRoles
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    // Add user from payload to request with federationRoles
    req.user = {
      ...decoded,
      federationRoles: user.federationRoles
    };
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
export const authorize = (roles: UserFederationRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      console.log("No user found in request"); // Debug log
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    console.log("User federation roles:", req.user.federationRoles); // Debug log
    console.log("Required roles:", roles); // Debug log

    // Check if user has any of the required roles
    const hasRequiredRole = roles.some((requiredRole) => {
      // If required role has wildcard federationId, check role only
      if (requiredRole.federationId === "*") {
        return req.user?.federationRoles.some(
          (userRole) => userRole.role === requiredRole.role
        );
      }
      // Otherwise check both role and federationId
      return req.user?.federationRoles.some(
        (userRole) =>
          userRole.role === requiredRole.role &&
          userRole.federationId === requiredRole.federationId
      );
    });

    if (!hasRequiredRole) {
      console.log("User role not authorized"); // Debug log
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this resource",
      });
    }

    next();
  };
};
