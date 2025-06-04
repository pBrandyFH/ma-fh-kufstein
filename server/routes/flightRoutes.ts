import express from "express";
import { auth, authorize } from "../middleware/auth";
import {
  createFlight,
  getFlightsByCompetition,
  updateFlightStatus,
  recalculateFlightStatus,
  updateFlight,
} from "../controllers/flightController";

const router = express.Router();

// Get all flights for a competition
router.get("/competition/:id", getFlightsByCompetition);

// Create a new flight
router.post(
  "/",
  auth,
  authorize([
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    { role: "SUPERADMIN", federationId: "*" },
  ]),
  createFlight
);

// Update flight
router.put(
  "/:id",
  auth,
  authorize([
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    { role: "SUPERADMIN", federationId: "*" },
  ]),
  updateFlight
);

// Update flight status
router.patch(
  "/:id/status",
  auth,
  authorize([
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    { role: "SUPERADMIN", federationId: "*" },
  ]),
  updateFlightStatus
);

// Recalculate flight status
router.post(
  "/:id/recalculate-status",
  auth,
  authorize([
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    { role: "SUPERADMIN", federationId: "*" },
  ]),
  recalculateFlightStatus
);

export default router;
