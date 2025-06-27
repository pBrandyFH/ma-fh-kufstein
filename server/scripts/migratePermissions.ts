import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User";
import Federation from "../models/Federation";
import { FederationLevel, RoleType } from "../permissions/types";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/powerlift-tool";

// Mapping from old federation types to new levels
const federationLevelMap: Record<string, FederationLevel> = {
  international: "INTERNATIONAL",
  national: "NATIONAL",
  federalState: "STATE",
  continental: "REGIONAL",
};

// Mapping from old roles to new roles
const roleMap: Record<string, RoleType> = {
  internationalAdmin: "SUPERADMIN",
  continentalAdmin: "FEDERATION_ADMIN",
  stateAdmin: "FEDERATION_ADMIN",
  federalStateAdmin: "FEDERATION_ADMIN",
};

async function migratePermissions() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Update federation levels
    const federations = await Federation.find();
    console.log(`Found ${federations.length} federations to process`);

    let updatedFederations = 0;
    for (const federation of federations) {
      const oldType = federation.type;
      const newLevel = federationLevelMap[oldType];

      if (newLevel) {
        try {
          (federation as any).level = newLevel;
          await federation.save();
          console.log(
            `Updated federation ${federation.name} (${federation._id}) from ${oldType} to ${newLevel}`
          );
          updatedFederations++;
        } catch (error) {
          console.error(`Error updating federation ${federation.name}:`, error);
        }
      } else {
        console.log(
          `Skipping federation ${federation.name} - no mapping for type ${oldType}`
        );
      }
    }
    console.log(`Updated ${updatedFederations} federations`);

    // Update user roles
    const users = await User.find();
    console.log(`Found ${users.length} users to process`);

    let updatedUsers = 0;
    let skippedUsers = 0;
    for (const user of users) {
      try {
        // Skip if user already has federationRoles
        if (user.federationRoles && user.federationRoles.length > 0) {
          console.log(
            `Skipping user ${user.email} - already has federationRoles`
          );
          skippedUsers++;
          continue;
        }

        const oldRole = (user as any).role;
        const oldFederationId = (user as any).federationId;
        const oldClubId = (user as any).clubId;
        const oldAthleteId = (user as any).athleteId;

        console.log(`Processing user ${user.email}:`, {
          oldRole,
          oldFederationId,
          oldClubId,
          oldAthleteId,
        });

        // Create federationRoles array
        user.federationRoles = [];

        // Add federation role if exists
        if (oldRole && oldFederationId) {
          const newRole = roleMap[oldRole];
          if (newRole) {
            user.federationRoles.push({
              federationId: oldFederationId,
              role: newRole,
              overridePermissions: [],
            });
            console.log(
              `Added federation role ${newRole} for user ${user.email} in federation ${oldFederationId}`
            );
          } else {
            console.log(`No mapping found for role ${oldRole}`);
          }
        }

        // Add club role if exists
        if (oldRole && oldClubId) {
          const newRole = roleMap[oldRole];
          if (newRole) {
            user.federationRoles.push({
              federationId: oldClubId,
              role: newRole,
              overridePermissions: [],
            });
            console.log(
              `Added club role ${newRole} for user ${user.email} in club ${oldClubId}`
            );
          } else {
            console.log(`No mapping found for role ${oldRole}`);
          }
        }

        // Add athlete role if exists
        if (oldAthleteId) {
          user.federationRoles.push({
            federationId: oldFederationId || oldClubId,
            role: "ATHLETE",
            overridePermissions: [],
          });
          console.log(`Added athlete role for user ${user.email}`);
        }

        if (user.federationRoles.length > 0) {
          await user.save();
          console.log(
            `Updated user ${user.email} with ${user.federationRoles.length} roles`
          );
          updatedUsers++;
        } else {
          console.log(`No roles to add for user ${user.email}`);
        }
      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error);
      }
    }

    console.log(`Migration summary:
    - Total federations: ${federations.length}
    - Updated federations: ${updatedFederations}
    - Total users: ${users.length}
    - Updated users: ${updatedUsers}
    - Skipped users: ${skippedUsers}`);
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

migratePermissions();
