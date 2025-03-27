// User and Authentication Types
export type UserRole =
  | "athlete"
  | "coach"
  | "official"
  | "clubAdmin"
  | "federalStateAdmin"
  | "stateAdmin"
  | "continentalAdmin"
  | "internationalAdmin";

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  federationId?: string;
  clubId?: string;
  athleteId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Federation Types
export type FederationType =
  | "international"
  | "continental"
  | "national"
  | "federalState";

export interface Federation {
  _id: string;
  name: string;
  abbreviation: string;
  type: FederationType;
  parent?: Federation;
  children: Federation[];
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
  dateOfBirth: Date;
  gender: Gender;
  weightCategory: WeightCategory;
  clubId: string | Club;
  federationId: string | Federation;
  coachIds?: string[];
  isNationalTeam?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Competition Types
export type EquipmentType =
  | "equipped"
  | "classic"
  | "equippedBench"
  | "classicBench";
export type AgeCategory =
  | "subJuniors"
  | "juniors"
  | "open"
  | "masters1"
  | "masters2"
  | "masters3"
  | "masters4"
  | "masters";
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
  hostFederationId: string | Federation;
  hostClubId?: string | Club;
  eligibleFederationIds: string[] | Federation[];
  equipmentType: EquipmentType;
  ageCategories: AgeCategory[];
  description?: string;
  status: CompetitionStatus;
  nominationDeadline: Date;
  officialIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Nomination Types
export type NominationStatus = "pending" | "approved" | "rejected";

export interface Nomination {
  _id: string;
  athleteId: string | Athlete;
  competitionId: string | Competition;
  weightCategory: WeightCategory;
  ageCategory: AgeCategory;
  status: NominationStatus;
  nominatedBy: string | User;
  nominatedAt: Date;
  updatedAt: Date;
}

// Result Types
export interface Lift {
  attempt1: number | null;
  attempt2: number | null;
  attempt3: number | null;
  best: number | null;
}

export interface Result {
  _id: string;
  competitionId: string | Competition;
  athleteId: string | Athlete;
  weightCategory: WeightCategory;
  ageCategory: AgeCategory;
  bodyweight: number;
  squat: Lift;
  bench: Lift;
  deadlift: Lift;
  total: number;
  wilks: number;
  ipfPoints: number;
  place: number;
  createdAt: Date;
  updatedAt: Date;
}

// Invitation Types
export interface Invitation {
  _id: string;
  email: string;
  inviteCode: string;
  role: UserRole;
  federationId?: string | Federation;
  clubId?: string | Club;
  invitedBy: string | User;
  firstName?: string;
  lastName?: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  gender: Gender | "";
  weightCategory: WeightCategory | "";
  clubId: string | "";
  federationId: string | "";
  sendInvite: boolean;
}

export interface CompetitionFormValues {
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  location: string;
  address: string;
  city: string;
  country: string;
  hostFederationId: string;
  hostClubId: string;
  eligibleFederationIds: string[];
  equipmentType: EquipmentType | "";
  ageCategories: AgeCategory[];
  description: string;
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

export interface NominationFormValues {
  competitionId: string;
  athleteIds: string[];
}

export interface InvitationFormValues {
  email: string;
  role: UserRole | "";
  firstName?: string;
  lastName?: string;
  federationId?: string;
  clubId?: string;
}

// Populated types for API responses
export interface PopulatedInvitation
  extends Omit<Invitation, "invitedBy" | "federationId" | "clubId"> {
  invitedBy: User;
  federationId?: Federation;
  clubId?: Club;
}

export interface InviteValidationResponse {
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  federation?: Federation;
  club?: Club;
  expiresAt: Date;
}

// Select option type
export interface SelectOption {
  value: string;
  label: string;
}
