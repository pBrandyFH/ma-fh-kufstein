import type { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { randomBytes } from "crypto";
import mongoose from "mongoose";
import User from "../models/User";
import Invitation from "../models/Invitation";
import { sendInviteEmail } from "../utils/emailService";
import { DecodedToken, InviteValidationResponse } from "../types";
import { UserFederationRole, RoleType } from "../permissions/types";

let JWT_SECRET: string;
const INVITE_EXPIRY_DAYS: number = 7; // Invites expire after 7 days

// Initialize JWT secret
export const initializeAuth = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  JWT_SECRET = process.env.JWT_SECRET;
};

interface RegisterRequestBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  inviteCode: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

interface InviteRequestBody {
  email: string;
  role: RoleType;
  firstName?: string;
  lastName?: string;
  federationId: mongoose.Types.ObjectId;
}

interface ValidateInviteRequestBody {
  inviteCode: string;
  email: string;
}

// Extend Express Request type to include user
export interface AuthenticatedRequest<P = {}, ResBody = {}, ReqBody = {}>
  extends Request<P, ResBody, ReqBody> {
  user?: DecodedToken;
}

// Register a new user
export const register = async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response
) => {
  try {
    const { email, password, firstName, lastName, inviteCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    // Validate invite code
    if (!inviteCode) {
      return res.status(400).json({
        success: false,
        error: "Invite code is required",
      });
    }

    const invitation = await Invitation.findOne({
      inviteCode,
      email,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!invitation) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired invite code",
      });
    }

    // Create new user with federation role from invitation
    const user = new User({
      email,
      password,
      firstName: firstName || invitation.firstName,
      lastName: lastName || invitation.lastName,
      federationRoles: [{
        federationId: invitation.federationId,
        role: invitation.role as RoleType,
        overridePermissions: []
      }]
    });

    await user.save();

    // Mark invitation as used
    invitation.used = true;
    await invitation.save();

    // Generate JWT token
    const token = sign(
      { id: user._id, email: user.email, federationRoles: user.federationRoles },
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

    res.status(201).json({
      success: true,
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Server error during registration",
    });
  }
};

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

// Send invite to a new user
export const sendInvite = async (
  req: AuthenticatedRequest<{}, {}, InviteRequestBody>,
  res: Response
) => {
  try {
    const { email, role, firstName, lastName, federationId } = req.body;
    const invitedBy = req.user?.id;

    if (!invitedBy) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    // Check if there's an active invitation
    const existingInvitation = await Invitation.findOne({
      email,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        error: "An active invitation already exists for this email",
      });
    }

    // Generate a unique invite code
    const inviteCode = randomBytes(16).toString("hex");

    // Set expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

    // Create invitation
    const invitation = new Invitation({
      email,
      inviteCode,
      role,
      federationId,
      invitedBy,
      firstName,
      lastName,
      expiresAt,
    });

    await invitation.save();

    // Send invite email
    await sendInviteEmail(
      email,
      firstName || "",
      lastName || "",
      inviteCode,
      role
    );

    res.status(200).json({
      success: true,
      message: "Invitation sent successfully",
      data: {
        inviteCode,
        expiresAt,
      },
    });
  } catch (error) {
    console.error("Send invite error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while sending invite",
    });
  }
};

// Get all invitations (admin only)
export const getAllInvitations = async (req: Request, res: Response) => {
  try {
    const invitations = await Invitation.find()
      .populate("invitedBy", "firstName lastName email")
      .populate("federationId", "name abbreviation")
      .populate("clubId", "name abbreviation")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    console.error("Get all invitations error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching invitations",
    });
  }
};

// Get invitations by user
export const getMyInvitations = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const invitations = await Invitation.find({ invitedBy: userId })
      .populate("federationId", "name abbreviation")
      .populate("clubId", "name abbreviation")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    console.error("Get my invitations error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching invitations",
    });
  }
};

// Resend invitation
export const resendInvitation = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const invitation = await Invitation.findById(id);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: "Invitation not found",
      });
    }

    // Check if invitation is already used
    if (invitation.used) {
      return res.status(400).json({
        success: false,
        error: "Invitation has already been used",
      });
    }

    // Update expiry date
    invitation.expiresAt = new Date();
    invitation.expiresAt.setDate(
      invitation.expiresAt.getDate() + INVITE_EXPIRY_DAYS
    );
    await invitation.save();

    // Resend invite email
    await sendInviteEmail(
      invitation.email,
      invitation.firstName || "",
      invitation.lastName || "",
      invitation.inviteCode,
      invitation.role as RoleType
    );

    res.status(200).json({
      success: true,
      message: "Invitation resent successfully",
      data: invitation,
    });
  } catch (error) {
    console.error("Resend invitation error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while resending invitation",
    });
  }
};

// Delete invitation
export const deleteInvitation = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const invitation = await Invitation.findById(id);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: "Invitation not found",
      });
    }

    // Check if invitation is already used
    if (invitation.used) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete an invitation that has already been used",
      });
    }

    await Invitation.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Invitation deleted successfully",
    });
  } catch (error) {
    console.error("Delete invitation error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while deleting invitation",
    });
  }
};

// Validate invite code (public)
export const validateInviteCode = async (
  req: Request<{}, {}, ValidateInviteRequestBody>,
  res: Response
) => {
  try {
    const { inviteCode, email } = req.body;

    if (!inviteCode || !email) {
      return res.status(400).json({
        success: false,
        error: "Invite code and email are required",
      });
    }

    const invitation = await Invitation.findOne({
      inviteCode,
      email,
      used: false,
      expiresAt: { $gt: new Date() },
    })
      .populate<{
        federationId: {
          _id: mongoose.Types.ObjectId;
          name: string;
          abbreviation: string;
        };
      }>("federationId", "name abbreviation")
      .populate<{
        clubId: {
          _id: mongoose.Types.ObjectId;
          name: string;
          abbreviation: string;
        };
      }>("clubId", "name abbreviation");

    if (!invitation) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired invite code",
      });
    }

    const response: InviteValidationResponse = {
      valid: true,
      role: invitation.role as RoleType,
      federation: invitation.federationId
        ? {
            id: invitation.federationId._id.toString(),
            name: invitation.federationId.name,
            abbreviation: invitation.federationId.abbreviation,
          }
        : undefined,
      firstName: invitation.firstName,
      lastName: invitation.lastName,
    };

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Validate invite code error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while validating invite code",
    });
  }
};
