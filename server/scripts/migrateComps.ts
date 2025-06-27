import mongoose from "mongoose";
import dotenv from "dotenv";
import Competition from "../models/Competition";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/powerlift-tool";

  async function migrateCompetitions() {
    try {
      // Connect to MongoDB
      await mongoose.connect(MONGODB_URI);
      console.log("Connected to MongoDB");

      // Get all competitions
      const competitions = await Competition.find({});
      console.log(`Found ${competitions.length} competitions to update`);

      // Update each competition to add nominationStart
      for (const comp of competitions) {
        const nominationStart = new Date(comp.nominationDeadline);
        nominationStart.setMonth(nominationStart.getMonth() - 3);
        
        await Competition.updateOne(
          { _id: comp._id },
          { $set: { nominationStart } }
        );
      }

      console.log("Successfully updated all competitions with nominationStart");
    } catch (error) {
      console.error("Error migrating competitions:", error);
    } finally {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB");
    }
  }

  // Run the migration
  migrateCompetitions();