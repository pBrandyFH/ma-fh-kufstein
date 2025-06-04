import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import memberRoutes from "./routes/memberRoutes";
import athleteRoutes from "./routes/athleteRoutes";
import competitionRoutes from "./routes/competitionRoutes";
import federationRoutes from "./routes/federationRoutes";
import clubRoutes from "./routes/clubRoutes";
import nominationRoutes from "./routes/nominationRoutes";
import resultRoutes from "./routes/resultRoutes";
import permissionRoutes from "./routes/permissionRoutes";
import flightRoutes from "./routes/flightRoutes";
import { initializeAuth } from "./controllers/authController";
import { initializeAuth as initializeAuthMiddleware } from "./middleware/auth";

// Load environment variables
dotenv.config();

// Initialize auth
try {
  initializeAuth();
  initializeAuthMiddleware();
  console.log("Auth initialized successfully");
} catch (error) {
  console.error("Failed to initialize auth:", error);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/goodlift";

// Middleware
app.use(cors());
app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/athletes", athleteRoutes);
app.use("/api/competitions", competitionRoutes);
app.use("/api/federations", federationRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/nominations", nominationRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/flights", flightRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `API Documentation available at http://localhost:${PORT}/api-docs`
  );
});
