import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User";

// Load environment variables
dotenv.config();

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("Connected to MongoDB");

    // Create test user
    const psvAdmin = new User({
      email: "psv.admin@example.com",
      password: "password123",
      firstName: "PSV",
      lastName: "Admin",
      federationRoles: {
        federationId: "683d7949aefcdfcc45c2a207",
        memberId: "683d84616e4a13090230435d",
        role: "MEMBER_ADMIN",
      },
    });
    await psvAdmin.save();

    process.exit(0);
  } catch (error) {
    console.error("Error creating test user:", error);
    process.exit(1);
  }
};

createTestUser();
