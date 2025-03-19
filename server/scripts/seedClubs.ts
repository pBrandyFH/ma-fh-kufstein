import mongoose from "mongoose"
import dotenv from "dotenv"
import Club from "../models/Club"
import Federation from "../models/Federation"
import User from "../models/User"

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/goodlift"

const seedClubs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")

    // Clear existing clubs
    await Club.deleteMany({})
    console.log("Cleared existing clubs")

    // Get federations
    const slv = await Federation.findOne({ abbreviation: "SLV" })
    const kdb = await Federation.findOne({ abbreviation: "KDB" })

    if (!slv || !kdb) {
      console.error("Required federations not found. Run seedFederations.ts first.")
      process.exit(1)
    }

    // Create admin users for each club
    const psvAdmin = new User({
      email: "psv.admin@example.com",
      password: "password123",
      firstName: "PSV",
      lastName: "Admin",
      role: "clubAdmin",
    })
    await psvAdmin.save()

    const askAdmin = new User({
      email: "ask.admin@example.com",
      password: "password123",
      firstName: "ASK",
      lastName: "Admin",
      role: "clubAdmin",
    })
    await askAdmin.save()

    const kscAdmin = new User({
      email: "ksc.admin@example.com",
      password: "password123",
      firstName: "KSC",
      lastName: "Admin",
      role: "clubAdmin",
    })
    await kscAdmin.save()

    // Create clubs
    const psv = new Club({
      name: "PSV Salzburg",
      abbreviation: "PSV",
      federationId: slv._id,
      adminId: psvAdmin._id,
      contactEmail: "psv.admin@example.com",
      city: "Salzburg",
      country: "Austria",
    })
    await psv.save()

    // Update admin with club ID
    psvAdmin.clubId = psv._id
    await psvAdmin.save()

    const ask = new Club({
      name: "ASK Salzburg",
      abbreviation: "ASK",
      federationId: slv._id,
      adminId: askAdmin._id,
      contactEmail: "ask.admin@example.com",
      city: "Salzburg",
      country: "Austria",
    })
    await ask.save()

    askAdmin.clubId = ask._id
    await askAdmin.save()

    const ksc = new Club({
      name: "Kraftsport Club München",
      abbreviation: "KSC",
      federationId: kdb._id,
      adminId: kscAdmin._id,
      contactEmail: "ksc.admin@example.com",
      city: "Munich",
      country: "Germany",
    })
    await ksc.save()

    kscAdmin.clubId = ksc._id
    await kscAdmin.save()

    console.log("Clubs seeded successfully")
    process.exit(0)
  } catch (error) {
    console.error("Error seeding clubs:", error)
    process.exit(1)
  }
}

seedClubs()

