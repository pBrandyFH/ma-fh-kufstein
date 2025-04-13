import { Request } from "express";
import { UserFederationRole, RoleType } from "./permissions/types";

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
