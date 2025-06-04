import { Request } from "express";
import { UserFederationRole, RoleType } from "./permissions/types";
import mongoose from "mongoose";

export interface DecodedToken {
  id: string;
  email: string;
  federationRoles: UserFederationRole[];
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest<P = {}, ResBody = {}, ReqBody = {}>
  extends Request<P, ResBody, ReqBody> {
  user?: DecodedToken;
}

export interface InviteValidationResponse {
  valid: boolean;
  role: RoleType;
  federation?: {
    id: string;
    name: string;
    abbreviation: string;
  };
  firstName?: string;
  lastName?: string;
}

// Deprecated - use RoleType from permissions/types instead
export type UserRole = RoleType;

export interface Result {
  athleteId: mongoose.Types.ObjectId;
  competitionId: mongoose.Types.ObjectId;
  weightCategory: string;
  ageCategory: string;
  bodyweight: number;
  lotNumber?: number;
  flightNumber?: number;
  groupNumber?: number;
  squat: {
    attempt1: number | null;
    attempt2: number | null;
    attempt3: number | null;
    best: number | null;
  };
  bench: {
    attempt1: number | null;
    attempt2: number | null;
    attempt3: number | null;
    best: number | null;
  };
  deadlift: {
    attempt1: number | null;
    attempt2: number | null;
    attempt3: number | null;
    best: number | null;
  };
  total: number | null;
  wilks: number | null;
  ipfPoints: number | null;
  place: number | null;
  createdAt: Date;
  updatedAt: Date;
}
