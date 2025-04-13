import { UserFederationRole, Permission, RoleDefinition, Federation } from "./types";

export function hasPermission(
  userRoles: UserFederationRole[],
  federationId: string,
  required: Permission,
  roleDefinitions: Record<string, RoleDefinition>
): boolean {
  const role = userRoles.find(f => f.federationId === federationId);
  if (!role) return false;

  // Check override permissions first
  if (role.overridePermissions?.includes(required)) {
    return true;
  }

  const roleDef = roleDefinitions[role.role];
  return roleDef?.permissions.includes(required) ?? false;
}

export function canNominateTo(
  userRoles: UserFederationRole[],
  targetFederation: Federation,
  roleDefinitions: Record<string, RoleDefinition>
): boolean {
  for (const { role } of userRoles) {
    const roleDef = roleDefinitions[role];
    const canNominate = roleDef?.allowedNominationLevels.includes(targetFederation.level);
    if (canNominate) return true;
  }

  return false;
}

export function getEffectivePermissions(
  userRoles: UserFederationRole[],
  federationId: string,
  roleDefinitions: Record<string, RoleDefinition>
): Permission[] {
  const role = userRoles.find(f => f.federationId === federationId);
  if (!role) return [];

  const roleDef = roleDefinitions[role.role];
  if (!roleDef) return [];

  // Combine role permissions with override permissions
  const permissions = new Set<Permission>([...roleDef.permissions]);
  if (role.overridePermissions) {
    role.overridePermissions.forEach(p => permissions.add(p));
  }

  return Array.from(permissions);
} 