import { UserFederationRole, RoleType, Permission } from "./permissions";

// User and Authentication Types
export type UserRole = RoleType;

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  federationRoles: UserFederationRole[];
  createdAt: Date;
  updatedAt: Date;
}

// Federation Types
export type FederationType =
  | "INTERNATIONAL"
  | "REGIONAL"
  | "NATIONAL"
  | "STATE"
  | "LOCAL";

export interface Federation {
  _id: string;
  name: string;
  abbreviation: string;
  type: FederationType;
  parents?: Federation[];
  adminId?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Club Types
export interface Club {
  _id: string;
  name: string;
  abbreviation: string;
  federationId: string | Federation;
  adminId?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Member {
  _id: string;
  name: string;
  federation: Federation;
  athletes: Athlete[];
  type: "CLUB" | "INDIVIDUAL" | "UNIVERSITY";
}

export interface MemberFormValues {
  name: string;
  federationId: string;
  type: "CLUB" | "INDIVIDUAL" | "UNIVERSITY";
}

// Athlete Types
export type Gender = "male" | "female";

export type MaleWeightCategory =
  | "u53"
  | "u59"
  | "u66"
  | "u74"
  | "u83"
  | "u93"
  | "u105"
  | "u120"
  | "o120";
export type FemaleWeightCategory =
  | "u43"
  | "u47"
  | "u52"
  | "u57"
  | "u63"
  | "u69"
  | "u76"
  | "u84"
  | "o84";
export type WeightCategory = MaleWeightCategory | FemaleWeightCategory;

export interface Athlete {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date;
  gender: Gender;
  weightCategory: WeightCategory;
  member: Member;
  federation: Federation;
  coaches?: User;
  isNationalTeam?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Competition Types
export type EquipmentType = "CLASSIC" | "SINGLE" | "BP_CLASSIC" | "BP_SINGLE";
export type AgeCategory =
  | "SUB_JUNIORS"
  | "JUNIORS"
  | "OPEN"
  | "MASTERS_1"
  | "MASTERS_2"
  | "MASTERS_3"
  | "MASTERS_4";
export type CompetitionStatus = "upcoming" | "ongoing" | "completed";

export interface Competition {
  _id: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  location: string;
  address?: string;
  city: string;
  country: string;
  hostFederation: Federation;
  hostMember?: Member;
  eligibleFederations: string[] | Federation[];
  equipmentType: EquipmentType;
  ageCategories: AgeCategory[];
  description?: string;
  status: CompetitionStatus;
  nominationStart: Date;
  nominationDeadline: Date;
  officialIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Result Types
export type JudgeDecision = "good" | "noGood";
export type AttemptStatus = JudgeDecision | "pending";

// Flight Types
export type FlightStatus = "pending" | "inProgress" | "completed";

export interface Flight {
  _id: string;
  competitionId: string | Competition;
  number: number;
  status: FlightStatus;
  startTime?: Date;
  groups: Group[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  _id: string;
  flightId: string | Flight;
  number: number;
  name: string;
  startTime?: Date;
  nominations: Nomination[];
  createdAt: Date;
  updatedAt: Date;
}

// Update Nomination interface to use groupId instead of flight/group properties
export interface Nomination {
  _id: string;
  athleteId: Athlete;
  competitionId: string | Competition;
  groupId?: string | Group; // Reference to Group instead of flight/group properties
  weightCategory: WeightCategory;
  ageCategory: AgeCategory;
  nominatedBy: string | User;
  nominatedAt: Date;
  updatedAt: Date;
}

// Update Result interface to use nominationId
export interface Result {
  _id: string;
  nominationId: string | Nomination; // Add nominationId reference
  athleteId:
    | {
        _id: string;
        firstName: string;
        lastName: string;
      }
    | string;
  competitionId: string;
  weighIn?: {
    bodyweight: number;
    lotNumber: number;
    timestamp?: Date;
  };
  attempts: {
    squat: Array<{
      weight: number | null;
      status: AttemptStatus | null;
      timestamp?: Date | null;
      _id?: string;
    }>;
    bench: Array<{
      weight: number | null;
      status: AttemptStatus | null;
      timestamp?: Date | null;
      _id?: string;
    }>;
    deadlift: Array<{
      weight: number | null;
      status: AttemptStatus | null;
      timestamp?: Date | null;
      _id?: string;
    }>;
  };
  best?: {
    squat: number | null;
    bench: number | null;
    deadlift: number | null;
  };
  currentAttempt: {
    squat: number;
    bench: number;
    deadlift: number;
  };
  athlete?: Athlete;
  weightCategory: string;
  ageCategory: string;
  total?: number | null;
  wilks?: number | null;
  ipfPoints?: number | null;
  place?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  inviteCode: string;
}

export interface AthleteFormValues {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date | null;
  gender: Gender | null;
  weightCategory: WeightCategory | null;
  member: string;
  federation: string;
  sendInvite: boolean;
  isNationalTeam?: boolean;
}
export interface CompetitionFormValues {
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  location: string;
  address: string;
  city: string;
  country: string;
  hostFederation: string | Federation;
  hostMember: string | Member | null;
  eligibleFederations: (string | Federation)[];
  equipmentType: EquipmentType | null;
  ageCategories: AgeCategory[];
  description: string;
  nominationStart: Date | null;
  nominationDeadline: Date | null;
}

export interface FederationFormValues {
  name: string;
  abbreviation: string;
  type: FederationType | "";
  parentFederationId: string;
  adminEmail: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  address: string;
  city: string;
  country: string;
  sendInvite: boolean;
}

export interface ClubFormValues {
  name: string;
  abbreviation: string;
  federationId: string;
  adminEmail: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  address: string;
  city: string;
  country: string;
  sendInvite: boolean;
}

export interface LegacyNominationFormValues {
  competitionId: string;
  athleteIds: string[];
}

export interface CreateNominationFormValues {
  athleteId: string;
  competitionId: string;
  weightCategory: WeightCategory;
  ageCategory: AgeCategory;
}

export interface InviteValidationResponse {
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserFederationRole;
  federation?: Federation;
  club?: Club;
  expiresAt: Date;
}

// Select option type
export interface SelectOption {
  value: string;
  label: string;
}

// Add new form types for flight operations
export interface CreateFlightFormValues {
  competitionId: string;
  number: number;
  startTime?: Date;
  groups: Array<{
    number: number;
    name: string;
    startTime?: Date;
    nominationIds: string[];
  }>;
}

export interface UpdateFlightStatusFormValues {
  status: FlightStatus;
}
