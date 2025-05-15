import { RoleDefinition, FederationLevel, Permission } from "./types";

export const roleDefinitions: Record<string, RoleDefinition> = {
  ATHLETE: {
    name: "ATHLETE",
    allowedNominationLevels: [
      "LOCAL",
      "STATE",
      "NATIONAL",
      "REGIONAL",
      "INTERNATIONAL",
    ],
    permissions: ["VIEW_STRUCTURE", "NOMINATE_SELF"],
  },
  MEMBER_ADMIN: {
    name: "MEMBER_ADMIN",
    allowedNominationLevels: ["STATE", "NATIONAL"],
    permissions: [
      "VIEW_STRUCTURE",
      "NOMINATE_ATHLETE",
      "MANAGE_CLUB_ATHLETES",
      "MANAGE_MEMBERS",
    ],
  },
  FEDERATION_ADMIN: {
    name: "FEDERATION_ADMIN",
    allowedNominationLevels: ["NATIONAL", "REGIONAL"],
    permissions: [
      "VIEW_STRUCTURE",
      "NOMINATE_ATHLETE",
      "MANAGE_MEMBERS",
      "APPROVE_REQUESTS",
      "CREATE_COMPETITION",
    ],
  },
  SUPERADMIN: {
    name: "SUPERADMIN",
    allowedNominationLevels: ["INTERNATIONAL"],
    permissions: [
      "VIEW_STRUCTURE",
      "NOMINATE_ATHLETE",
      "MANAGE_MEMBERS",
      "APPROVE_REQUESTS",
      "CREATE_COMPETITION",
      "CONFIGURE_STRUCTURE",
      "ASSIGN_ROLES",
    ],
  },
};
