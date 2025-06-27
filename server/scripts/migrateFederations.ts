import mongoose, { ObjectId } from "mongoose";
import Federation, { IFederation } from "../models/Federation";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/powerlift-tool";

const federationParentMap: Record<string, string> = {
  IPF: "67e589b739273d48c69f36e9",
  EPF: "67e589b739273d48c69f36e9",
  APF: "67e589b739273d48c69f36e9",
  NAPF: "67e589b739273d48c69f36e9",
  FESUPO: "67e589b739273d48c69f36e9",
  BP: "67e589b739273d48c69f36eb",
  BVDK: "67e589b739273d48c69f36eb",
  EP: "67e589b739273d48c69f36ef",
  SP: "67e589b739273d48c69f36ef",
  WPA: "67e589b739273d48c69f36ef",
  KDB: "67e589b839273d48c69f36f1",
};

async function migrateFederations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get all federations
    const federations = await Federation.find();
    console.log(`Found ${federations.length} federations to migrate`);

    // Update each federation to use parents array instead of parent
    for (const federation of federations) {
      const abb = federation.abbreviation;

      // Convert single parent to parents array
      await Federation.findByIdAndUpdate(federation._id, {
        $set: { parents: [federationParentMap[abb]] },
        $unset: { parent: 1 },
      });
      console.log(`Migrated federation ${federation.name} (${federation._id})`);
    }

    console.log("Migration completed successfully");
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error migrating federations:", error);
    process.exit(1);
  }
}

migrateFederations();
