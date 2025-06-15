import type { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import User from "../models/User";
import { DecodedToken } from "../types";

let JWT_SECRET: string;

// Initialize JWT secret
export const initializeAuth = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  JWT_SECRET = process.env.JWT_SECRET;
};

interface LoginRequestBody {
  email: string;
  password: string;
}

// Extend Express Request type to include user
export interface AuthenticatedRequest<P = {}, ResBody = {}, ReqBody = {}>
  extends Request<P, ResBody, ReqBody> {
  user?: DecodedToken;
}

// Login user
export const login = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = sign(
      { id: user._id, email: user.email, role: user.federationRoles },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user data (excluding password) and token
    const userData = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      federationRoles: user.federationRoles,
    };

    res.status(200).json({
      success: true,
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Server error during login",
    });
  }
};
