import mongoose from "mongoose";
import dotenv from "dotenv";
import Competition from "../models/Competition";
import Federation from "../models/Federation";
import Club from "../models/Club";
import Member from "../models/Member";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/goodlift";

const competitions = [
  {
    name: "German Nationals 2024",
    startDate: new Date("2025-06-15"),
    endDate: new Date("2025-06-20"),
    location: "Berlin Sports Complex",
    address: "Olympiastadion Berlin, Olympischer Platz 3",
    city: "Berlin",
    country: "Germany",
    equipmentType: "SINGLE",
    ageCategories: ["OPEN"],
    description: "The German National Powerlifting Championship 2024",
    status: "upcoming",
    nominationDeadline: new Date("2025-07-15"),
  },
  {
    name: "European Classic Championships 2024",
    startDate: new Date("2025-07-20"),
    endDate: new Date("2025-07-25"),
    location: "Stockholm Arena",
    address: "Arenavägen 69",
    city: "Stockholm",
    country: "Sweden",
    equipmentType: "CLASSIC",
    ageCategories: ["OPEN", "JUNIORS", "MASTERS_1", "MASTERS_2", "MASTERS_3", "MASTERS_4"],
    description: "European Classic Powerlifting Championships 2024",
    status: "upcoming",
    nominationDeadline: new Date("2025-06-20"),
  },
  {
    name: "Bavarian State Championship 2025",
    startDate: new Date("2025-05-14"),
    endDate: new Date("2025-05-20"),
    location: "Munich Powerlifting Center",
    address: "Sportplatzstraße 1",
    city: "Munich",
    country: "Germany",
    equipmentType: "SINGLE",
    ageCategories: ["OPEN", "JUNIORS", "MASTERS_1"],
    description: "Bavarian State Powerlifting Championship 2024",
    status: "ongoing",
    nominationDeadline: new Date("2025-04-10"),
  },
  {
    name: "World MASTERS_ Championship 2023",
    startDate: new Date("2023-11-15"),
    endDate: new Date("2023-11-20"),
    location: "Oslo Convention Center",
    address: "Oslo Spektrum, Trondheimsveien 2",
    city: "Oslo",
    country: "Norway",
    equipmentType: "SINGLE",
    ageCategories: ["MASTERS_1", "MASTERS_2", "MASTERS_3", "MASTERS_4"],
    description: "World MASTERS_ Powerlifting Championship 2023",
    status: "completed",
    nominationDeadline: new Date("2023-10-15"),
  },
  {
    name: "Berlin OPEN 2025",
    startDate: new Date("2025-12-05"),
    endDate: new Date("2025-12-07"),
    location: "Berlin Powerlifting Club",
    address: "Kraftstraße 10",
    city: "Berlin",
    country: "Germany",
    equipmentType: "CLASSIC",
    ageCategories: ["OPEN", "JUNIORS"],
    description: "Berlin OPEN Powerlifting Championship 2024",
    status: "upcoming",
    nominationDeadline: new Date("2025-10-05"),
  },
];

async function seedCompetitions() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get all federations and clubs
    const federations = await Federation.find();
    const members = await Member.find();

    if (federations.length === 0 || members.length === 0) {
      console.error("No federations or clubs found. Please run seedFederations and seedClubs first.");
      process.exit(1);
    }

    // Clear existing competitions
    await Competition.deleteMany({});
    console.log("Cleared existing competitions");

    // Create competitions with references to existing federations and clubs
    const competitionsWithRefs = competitions.map((competition, index) => ({
      ...competition,
      hostFederation: federations[index % federations.length]._id,
      hostMember: members[index % members.length]._id,
      eligibleFederations: federations.map(f => f._id),
    }));

    // Insert competitions
    const result = await Competition.insertMany(competitionsWithRefs);
    console.log(`Successfully seeded ${result.length} competitions`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding competitions:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedCompetitions(); 