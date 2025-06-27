import mongoose from "mongoose";
import dotenv from "dotenv";
import Athlete from "../models/Athlete";

// Load environment variables
dotenv.config();

const federationId = "683d7949aefcdfcc45c2a207";
const memberIds = [
  "683d84616e4a13090230435d",
  "683d84746e4a130902304371",
  "683d9b886e4a13090230445a",
];

// Weight categories by distribution
const weightCategories = {
  light: {
    female: ["u47", "u52"],
    male: ["u59", "u66"],
  },
  middle: {
    female: ["u57", "u63", "u69", "u76"],
    male: ["u74", "u83", "u93", "u105"],
  },
  heavy: {
    female: ["u84", "o84"],
    male: ["u120", "o120"],
  },
};

// Helper function to get random date between 16 and 35 years ago
const getRandomBirthDate = () => {
  const now = new Date();
  const minAge = 16;
  const maxAge = 50;
  const minDate = new Date(now.getFullYear() - maxAge, 0, 1);
  const maxDate = new Date(now.getFullYear() - minAge, 11, 31);
  return new Date(
    minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime())
  );
};

// Helper function to get random weight category based on distribution
const getRandomWeightCategory = (gender: "male" | "female") => {
  const random = Math.random();
  if (random < 0.2) {
    // Light (20%)
    const categories = weightCategories.light[gender];
    return categories[Math.floor(Math.random() * categories.length)];
  } else if (random < 0.8) {
    // Middle (60%)
    const categories = weightCategories.middle[gender];
    return categories[Math.floor(Math.random() * categories.length)];
  } else {
    // Heavy (20%)
    const categories = weightCategories.heavy[gender];
    return categories[Math.floor(Math.random() * categories.length)];
  }
};

// Helper function to generate random name
const generateName = (isFirstName: boolean, gender: "male" | "female") => {
  const isFemale = gender === "female";

  const femaleFirstNames = [
    "Emma",
    "Lena",
    "Sophie",
    "Anna",
    "Marie",
    "Laura",
    "Julia",
    "Sarah",
    "Leonie",
    "Nina",
  ];
  const maleFirstNames = [
    "Max",
    "Paul",
    "Leon",
    "Finn",
    "Jonas",
    "Luis",
    "Noah",
    "Elias",
    "Ben",
    "Tim",
  ];
  const lastNames = [
    "Müller",
    "Schmidt",
    "Schneider",
    "Fischer",
    "Weber",
    "Meyer",
    "Wagner",
    "Becker",
    "Hoffmann",
    "Schulz",
    "Koch",
    "Richter",
    "Bauer",
    "Klein",
    "Wolf",
    "Schröder",
    "Neumann",
    "Schwarz",
    "Zimmermann",
    "Braun",
  ];
  return isFirstName
    ? isFemale
      ? femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)]
      : maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)]
    : lastNames[Math.floor(Math.random() * lastNames.length)];
};

const createTestAthletes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("Connected to MongoDB");

    await Athlete.deleteMany({});

    // Create 10 athletes for each member
    for (const memberId of memberIds) {
      console.log(`Creating athletes for member ${memberId}...`);

      // Create 10 athletes (5 male, 5 female)
      for (let i = 0; i < 10; i++) {
        const gender = i < 5 ? "male" : ("female" as const);
        const athlete = new Athlete({
          firstName: generateName(true, gender),
          lastName: generateName(false, gender),
          dateOfBirth: getRandomBirthDate(),
          gender,
          weightCategory: getRandomWeightCategory(gender),
          member: memberId,
          federation: federationId,
          isNationalTeam: Math.random() < 0.2, // 20% chance of being in national team
        });

        await athlete.save();
        console.log(
          `Created athlete: ${athlete.firstName} ${athlete.lastName} (${athlete.weightCategory})`
        );
      }
    }

    console.log("Successfully created all athletes");
    process.exit(0);
  } catch (error) {
    console.error("Error creating test athletes:", error);
    process.exit(1);
  }
};

createTestAthletes();
