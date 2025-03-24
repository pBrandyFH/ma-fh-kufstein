import mongoose from "mongoose";
import dotenv from "dotenv";
import Competition from "../models/Competition";
import Federation from "../models/Federation";
import Club from "../models/Club";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/goodlift";

const competitions = [
  {
    name: "German Nationals 2024",
    startDate: new Date("2024-06-15"),
    endDate: new Date("2024-06-17"),
    location: "Berlin Sports Complex",
    address: "Olympiastadion Berlin, Olympischer Platz 3",
    city: "Berlin",
    country: "Germany",
    equipmentType: "equipped",
    ageCategories: ["open", "juniors", "masters1", "masters2"],
    description: "The German National Powerlifting Championship 2024",
    status: "upcoming",
    nominationDeadline: new Date("2024-05-15"),
  },
  {
    name: "European Classic Championships 2024",
    startDate: new Date("2024-07-20"),
    endDate: new Date("2024-07-25"),
    location: "Stockholm Arena",
    address: "Arenavägen 69",
    city: "Stockholm",
    country: "Sweden",
    equipmentType: "classic",
    ageCategories: ["open", "juniors", "masters1", "masters2", "masters3", "masters4"],
    description: "European Classic Powerlifting Championships 2024",
    status: "upcoming",
    nominationDeadline: new Date("2024-06-20"),
  },
  {
    name: "Bavarian State Championship 2024",
    startDate: new Date("2024-05-10"),
    endDate: new Date("2024-05-12"),
    location: "Munich Powerlifting Center",
    address: "Sportplatzstraße 1",
    city: "Munich",
    country: "Germany",
    equipmentType: "equipped",
    ageCategories: ["open", "juniors", "masters1"],
    description: "Bavarian State Powerlifting Championship 2024",
    status: "ongoing",
    nominationDeadline: new Date("2024-04-10"),
  },
  {
    name: "World Masters Championship 2023",
    startDate: new Date("2023-11-15"),
    endDate: new Date("2023-11-20"),
    location: "Oslo Convention Center",
    address: "Oslo Spektrum, Trondheimsveien 2",
    city: "Oslo",
    country: "Norway",
    equipmentType: "equipped",
    ageCategories: ["masters1", "masters2", "masters3", "masters4"],
    description: "World Masters Powerlifting Championship 2023",
    status: "completed",
    nominationDeadline: new Date("2023-10-15"),
  },
  {
    name: "Berlin Open 2024",
    startDate: new Date("2024-04-05"),
    endDate: new Date("2024-04-07"),
    location: "Berlin Powerlifting Club",
    address: "Kraftstraße 10",
    city: "Berlin",
    country: "Germany",
    equipmentType: "classic",
    ageCategories: ["open", "juniors"],
    description: "Berlin Open Powerlifting Championship 2024",
    status: "upcoming",
    nominationDeadline: new Date("2024-03-05"),
  },
];

async function seedCompetitions() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get all federations and clubs
    const federations = await Federation.find();
    const clubs = await Club.find();

    if (federations.length === 0 || clubs.length === 0) {
      console.error("No federations or clubs found. Please run seedFederations and seedClubs first.");
      process.exit(1);
    }

    // Clear existing competitions
    await Competition.deleteMany({});
    console.log("Cleared existing competitions");

    // Create competitions with references to existing federations and clubs
    const competitionsWithRefs = competitions.map((competition, index) => ({
      ...competition,
      hostFederationId: federations[index % federations.length]._id,
      hostClubId: clubs[index % clubs.length]._id,
      eligibleFederationIds: federations.map(f => f._id),
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