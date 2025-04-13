import { Request, Response, NextFunction } from "express";
import { hasPermission, getEffectivePermissions } from "../permissions/utils";
import { roleDefinitions } from "../permissions/roleDefinitions";
import { Permission } from "../permissions/types";
import { DecodedToken } from "../types";

export const requirePermission = (permission: Permission) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as DecodedToken;
      const federationId = req.params.federationId || req.body.federationId;

      if (!user || !federationId) {
        return res.status(403).json({
          success: false,
          error: "Permission denied",
        });
      }

      const hasRequiredPermission = hasPermission(
        user.federationRoles,
        federationId,
        permission,
        roleDefinitions
      );

      if (!hasRequiredPermission) {
        return res.status(403).json({
          success: false,
          error: "Permission denied",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const getPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as DecodedToken;
    const federationId = req.params.federationId || req.body.federationId;

    if (!user || !federationId) {
      return res.status(400).json({
        success: false,
        error: "User or federation ID missing",
      });
    }

    const permissions = getEffectivePermissions(
      user.federationRoles,
      federationId,
      roleDefinitions
    );

    res.status(200).json({
      success: true,
      data: {
        permissions,
      },
    });
  } catch (error) {
    next(error);
  }
}; 