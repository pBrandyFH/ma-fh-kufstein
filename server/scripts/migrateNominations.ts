import mongoose from "mongoose";
import dotenv from "dotenv";
import Nomination from "../models/Nomination";
import Flight from "../models/Flight";
import Group from "../models/Group";
import Competition from "../models/Competition";

dotenv.config();

// Define interface for legacy nomination fields
interface LegacyNominationFields {
  flightNumber?: number;
  groupNumber?: number;
}

async function migrateNominations(competitionId: string) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB");

    // Find the competition to verify it exists
    const competition = await Competition.findById(competitionId);
    if (!competition) {
      throw new Error(`Competition with ID ${competitionId} not found`);
    }

    // Find all nominations for this competition
    const nominations = await Nomination.find({ competitionId });
    console.log(`Found ${nominations.length} nominations for competition ${competitionId}`);

    // Log the first nomination to see its structure
    if (nominations.length > 0) {
      const rawDoc = nominations[0].toObject();
      console.log("Sample nomination structure:", JSON.stringify(rawDoc, null, 2));
    }

    // Group nominations by their current flight and group numbers
    const flightGroups = new Map<number, Map<number, typeof nominations>>();

    nominations.forEach((nomination) => {
      // Get the raw document to access legacy fields
      const rawDoc = nomination.toObject() as LegacyNominationFields & { _id: mongoose.Types.ObjectId; groupId?: mongoose.Types.ObjectId };
      
      console.log(`Processing nomination ${nomination._id}:`, {
        hasGroupId: !!rawDoc.groupId,
        flightNumber: rawDoc.flightNumber,
        groupNumber: rawDoc.groupNumber,
        allProperties: Object.keys(rawDoc)
      });

      // Skip nominations that are already using the new schema
      if (rawDoc.groupId) {
        console.log(`Skipping nomination ${nomination._id} as it's already using the new schema`);
        return;
      }

      // Get flight and group numbers from the legacy fields
      const flightNumber = rawDoc.flightNumber;
      const groupNumber = rawDoc.groupNumber;

      if (!flightNumber || !groupNumber) {
        console.log(`Skipping nomination ${nomination._id} as it has no flight/group assignment. Values:`, {
          flightNumber,
          groupNumber
        });
        return;
      }

      // Initialize flight map if it doesn't exist
      if (!flightGroups.has(flightNumber)) {
        flightGroups.set(flightNumber, new Map());
      }

      const groupMap = flightGroups.get(flightNumber)!;

      // Initialize group array if it doesn't exist
      if (!groupMap.has(groupNumber)) {
        groupMap.set(groupNumber, []);
      }

      // Add nomination to the group
      groupMap.get(groupNumber)!.push(nomination);
      console.log(`Added nomination ${nomination._id} to flight ${flightNumber}, group ${groupNumber}`);
    });

    console.log("Flight groups structure:", 
      Array.from(flightGroups.entries()).map(([flightNum, groups]) => ({
        flightNumber: flightNum,
        groupCount: groups.size,
        groups: Array.from(groups.entries()).map(([groupNum, noms]) => ({
          groupNumber: groupNum,
          nominationCount: noms.length
        }))
      }))
    );

    // Create flights and groups
    for (const [flightNumber, groups] of flightGroups) {
      console.log(`Creating flight ${flightNumber} with ${groups.size} groups`);

      // Create the flight
      const flight = new Flight({
        competitionId,
        number: flightNumber,
        status: "pending",
        startTime: undefined, // You might want to set this based on existing data
      });
      await flight.save();
      console.log(`Created flight ${flight._id}`);

      // Create groups for this flight
      for (const [groupNumber, groupNominations] of groups) {
        console.log(`Creating group ${groupNumber} with ${groupNominations.length} nominations`);

        const group = new Group({
          flightId: flight._id,
          number: groupNumber,
          name: `Group ${groupNumber}`,
          startTime: undefined, // You might want to set this based on existing data
        });
        await group.save();
        console.log(`Created group ${group._id}`);

        // Update nominations with the new groupId
        const nominationIds = groupNominations.map(n => n._id);
        await Nomination.updateMany(
          { _id: { $in: nominationIds } },
          { $set: { groupId: group._id } }
        );
        console.log(`Updated ${nominationIds.length} nominations with groupId ${group._id}`);
      }
    }

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Get competition ID from command line argument
const competitionId = process.argv[2];
if (!competitionId) {
  console.error("Please provide a competition ID as a command line argument");
  process.exit(1);
}

// Run the migration
migrateNominations(competitionId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
