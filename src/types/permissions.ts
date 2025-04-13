export type FederationLevel =
  | "INTERNATIONAL"
  | "REGIONAL"
  | "NATIONAL"
  | "STATE"
  | "LOCAL";

export type FederationStructure = "CLUB_BASED" | "MEMBER_BASED";

export type RoleType =
  | "ATHLETE"
  | "CLUB_ADMIN"
  | "STATE_ADMIN"
  | "NATIONAL_ADMIN"
  | "SUPERADMIN";

export type Permission =
  | "VIEW_STRUCTURE"
  | "NOMINATE_SELF"
  | "NOMINATE_ATHLETE"
  | "MANAGE_CLUB_ATHLETES"
  | "MANAGE_MEMBERS"
  | "APPROVE_REQUESTS"
  | "CREATE_COMPETITION"
  | "CONFIGURE_STRUCTURE"
  | "ASSIGN_ROLES";

export interface UserFederationRole {
  federationId: string;
  role: RoleType;
  overridePermissions?: Permission[];
}

export interface RoleDefinition {
  name: RoleType;
  structure?: FederationStructure;
  allowedNominationLevels: FederationLevel[];
  permissions: Permission[];
}

export interface Federation {
  _id: string;
  name: string;
  level: FederationLevel;
  structure: FederationStructure;
  country?: string;
  parentId?: string;
} 