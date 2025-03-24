import mongoose from "mongoose"
import dotenv from "dotenv"
import Club from "../models/Club"
import Federation from "../models/Federation"
import User from "../models/User"

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/goodlift"

const clubs = [
  {
    name: "Powerlifting Berlin",
    abbreviation: "PLB",
    contactName: "John Smith",
    contactEmail: "john.smith@plb.de",
    contactPhone: "+49 30 1234567",
    website: "www.powerlifting-berlin.de",
    address: "Kraftstraße 10",
    city: "Berlin",
    country: "Germany",
  },
  {
    name: "Munich Powerlifting Club",
    abbreviation: "MPC",
    contactName: "Maria Schmidt",
    contactEmail: "maria.schmidt@mpc.de",
    contactPhone: "+49 89 9876543",
    website: "www.mpc.de",
    address: "Sportplatzstraße 1",
    city: "Munich",
    country: "Germany",
  },
  {
    name: "Hamburg Powerlifting",
    abbreviation: "HPL",
    contactName: "Thomas Weber",
    contactEmail: "thomas.weber@hpl.de",
    contactPhone: "+49 40 4567890",
    website: "www.hpl.de",
    address: "Kraftweg 5",
    city: "Hamburg",
    country: "Germany",
  },
  {
    name: "Frankfurt Powerlifting",
    abbreviation: "FPL",
    contactName: "Sarah Müller",
    contactEmail: "sarah.mueller@fpl.de",
    contactPhone: "+49 69 2345678",
    website: "www.fpl.de",
    address: "Sportstraße 15",
    city: "Frankfurt",
    country: "Germany",
  },
  {
    name: "Cologne Powerlifting",
    abbreviation: "CPL",
    contactName: "Michael Koch",
    contactEmail: "michael.koch@cpl.de",
    contactPhone: "+49 221 3456789",
    website: "www.cpl.de",
    address: "Kraftplatz 3",
    city: "Cologne",
    country: "Germany",
  },
]

const seedClubs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")

    // Get all federations
    const federations = await Federation.find()

    if (federations.length === 0) {
      console.error("No federations found. Please run seedFederations first.")
      process.exit(1)
    }

    // Clear existing clubs
    await Club.deleteMany({})
    console.log("Cleared existing clubs")

    // Create clubs with references to existing federations
    const clubsWithRefs = clubs.map((club, index) => ({
      ...club,
      federationId: federations[index % federations.length]._id,
    }))

    // Insert clubs
    const result = await Club.insertMany(clubsWithRefs)
    console.log(`Successfully seeded ${result.length} clubs`)

    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
    process.exit(0)
  } catch (error) {
    console.error("Error seeding clubs:", error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

seedClubs()

