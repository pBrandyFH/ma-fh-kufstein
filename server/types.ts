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
  iat: number;
  exp: number;
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
