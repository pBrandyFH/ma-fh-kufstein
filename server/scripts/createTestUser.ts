import mongoose from "mongoose"
import dotenv from "dotenv"
import bcrypt from "bcryptjs"
import User from "../models/User"

// Load environment variables
dotenv.config()

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "")
    console.log("Connected to MongoDB")

    // Create test user
    const testUser = new User({
      email: "admin@goodlift.org",
      password: "test123",
      firstName: "Admin",
      lastName: "User",
      role: "internationalAdmin",
      federationId: null,
      clubId: null,
      athleteId: null,
    })

    // Check if user already exists
    const existingUser = await User.findOne({ email: testUser.email })
    if (existingUser) {
      console.log("Test user already exists")
      process.exit(0)
    }

    // Save user (password will be hashed by the pre-save hook)
    await testUser.save()
    console.log("Test user created successfully")
    console.log("Email:", testUser.email)
    console.log("Password: test123")
    console.log("Role:", testUser.role)

    process.exit(0)
  } catch (error) {
    console.error("Error creating test user:", error)
    process.exit(1)
  }
}

createTestUser() 