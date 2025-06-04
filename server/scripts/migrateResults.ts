import mongoose from "mongoose";
import dotenv from "dotenv";
import Result from "../models/Result";
import Nomination from "../models/Nomination";

dotenv.config();

async function migrateResults() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB");

    // Find all results without nominationId
    const results = await Result.find({ nominationId: { $exists: false } });
    console.log(`Found ${results.length} results to migrate`);

    // For each result, find the corresponding nomination and update
    for (const result of results) {
      const nomination = await Nomination.findOne({
        athleteId: result.athleteId,
        competitionId: result.competitionId
      });

      if (nomination) {
        result.nominationId = nomination._id;
        await result.save();
        console.log(`Updated result ${result._id} with nominationId ${nomination._id}`);
      } else {
        console.log(`No nomination found for result ${result._id}`);
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

// Run the migration
migrateResults()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 