import mongoose from "mongoose";
import dotenv from "dotenv";
import Member from "../models/Member";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/goodlift";

const members = [
  {
    name: "Powerlifting Berlin",
    type: "CLUB",
    federationId: "67e589b839273d48c69f36f1",
  },
  {
    name: "Munich Powerlifting Club",
    type: "CLUB",
    federationId: "67e589b839273d48c69f36f1",
  },
  {
    name: "Hamburg Powerlifting",
    type: "CLUB",
    federationId: "67e589b839273d48c69f36f1",
  },
  {
    name: "Frankfurt Powerlifting",
    type: "CLUB",
    federationId: "67e589b839273d48c69f36f1",
  },
  {
    name: "Nice Powerlifting",
    type: "CLUB",
    federationId: "67e589b739273d48c69f36ef",
  },
];

const seedMembers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing members
    await Member.deleteMany({});
    console.log("Cleared existing members");

    // Insert members
    const result = await Member.insertMany(members);
    console.log(`Successfully seeded ${result.length} members`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding members:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedMembers();
