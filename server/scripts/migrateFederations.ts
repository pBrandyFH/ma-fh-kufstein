import mongoose from "mongoose";
import Federation, { IFederation } from "../models/Federation";
import dotenv from "dotenv";

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/goodlift";

async function migrateFederations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Delete all existing federations
    await Federation.deleteMany({});
    console.log("Deleted all existing federations");

    // Create the federation hierarchy
    const federations = [
      // International Federation
      {
        name: "International Powerlifting Federation",
        abbreviation: "IPF",
        type: "international",
        parent: null,
        children: [],
        contactName: "IPF Admin",
        contactEmail: "admin@ipf.com",
        contactPhone: "+1234567890",
        website: "https://www.powerlifting.sport",
        address: "123 IPF Street",
        city: "Luxembourg",
        country: "Luxembourg",
      },
      // Continental Federations
      {
        name: "European Powerlifting Federation",
        abbreviation: "EPF",
        type: "continental",
        parent: "IPF", // Will be updated with actual ID
        children: [],
        contactName: "EPF Admin",
        contactEmail: "admin@epf.com",
        contactPhone: "+1234567891",
        website: "https://www.epf.com",
        address: "456 EPF Street",
        city: "London",
        country: "United Kingdom",
      },
      {
        name: "Asian Powerlifting Federation",
        abbreviation: "APF",
        type: "continental",
        parent: "IPF", // Will be updated with actual ID
        children: [],
        contactName: "APF Admin",
        contactEmail: "admin@apf.com",
        contactPhone: "+1234567892",
        website: "https://www.apf.com",
        address: "789 APF Street",
        city: "Tokyo",
        country: "Japan",
      },
      // National Federations
      {
        name: "British Powerlifting",
        abbreviation: "BP",
        type: "national",
        parent: "EPF", // Will be updated with actual ID
        children: [],
        contactName: "BP Admin",
        contactEmail: "admin@bp.com",
        contactPhone: "+1234567893",
        website: "https://www.bp.com",
        address: "101 BP Street",
        city: "London",
        country: "United Kingdom",
      },
      {
        name: "German Powerlifting Federation",
        abbreviation: "GPF",
        type: "national",
        parent: "EPF", // Will be updated with actual ID
        children: [],
        contactName: "GPF Admin",
        contactEmail: "admin@gpf.com",
        contactPhone: "+1234567894",
        website: "https://www.gpf.com",
        address: "102 GPF Street",
        city: "Berlin",
        country: "Germany",
      },
      // Federal State Federations
      {
        name: "England Powerlifting",
        abbreviation: "EP",
        type: "federalState",
        parent: "BP", // Will be updated with actual ID
        children: [],
        contactName: "EP Admin",
        contactEmail: "admin@ep.com",
        contactPhone: "+1234567895",
        website: "https://www.ep.com",
        address: "103 EP Street",
        city: "London",
        country: "United Kingdom",
      },
      {
        name: "Scotland Powerlifting",
        abbreviation: "SP",
        type: "federalState",
        parent: "BP", // Will be updated with actual ID
        children: [],
        contactName: "SP Admin",
        contactEmail: "admin@sp.com",
        contactPhone: "+1234567896",
        website: "https://www.sp.com",
        address: "104 SP Street",
        city: "Edinburgh",
        country: "United Kingdom",
      },
    ];

    // First pass: Create all federations without parent/children references
    const federationMap = new Map<string, string>();
    
    for (const federation of federations) {
      const { parent, children, ...federationData } = federation;
      const createdFederation = await Federation.create(federationData);
      federationMap.set(federation.abbreviation, createdFederation._id);
    }

    // Second pass: Update parent and children references
    for (const federation of federations) {
      const currentId = federationMap.get(federation.abbreviation);
      if (!currentId) continue;

      if (federation.parent) {
        const parentId = federationMap.get(federation.parent);
        if (parentId) {
          // Update the current federation with its parent
          await Federation.findByIdAndUpdate(
            currentId,
            { parent: parentId }
          );

          // Update the parent federation with this child
          await Federation.findByIdAndUpdate(
            parentId,
            { $addToSet: { children: currentId } }
          );
        }
      }
    }

    // Verify the hierarchy
    const allFederations = await Federation.find({}).lean();
    console.log("\nVerifying federation hierarchy:");
    for (const fed of allFederations) {
      console.log(`\n${fed.name} (${fed.abbreviation}):`);
      console.log(`Parent: ${fed.parent ? (await Federation.findById(fed.parent).lean())?.abbreviation : 'None'}`);
      console.log(`Children: ${fed.children.length}`);
      for (const childId of fed.children) {
        const child = await Federation.findById(childId).lean();
        console.log(`  - ${child?.abbreviation}`);
      }
    }

    console.log("\nSuccessfully migrated federations");
    process.exit(0);
  } catch (error) {
    console.error("Error migrating federations:", error);
    process.exit(1);
  }
}

migrateFederations(); 