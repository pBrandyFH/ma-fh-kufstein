import { Request } from "express";

export type UserRole =
  | "athlete"
  | "coach"
  | "official"
  | "clubAdmin"
  | "federalStateAdmin"
  | "stateAdmin"
  | "continentalAdmin"
  | "internationalAdmin";

export type FederationType =
  | "international"
  | "continental"
  | "national"
  | "federalState";

export interface DecodedToken {
  id: string;
  email: string;
  role: UserRole;
  federationId?: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest<
  P = {},
  ResBody = {},
  ReqBody = {}
> extends Request<P, ResBody, ReqBody> {
  user?: DecodedToken;
}

export interface InviteValidationResponse {
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  federation?: {
    name: string;
    abbreviation: string;
    _id: string;
  };
  club?: {
    name: string;
    abbreviation: string;
    _id: string;
  };
  expiresAt: Date;
}
