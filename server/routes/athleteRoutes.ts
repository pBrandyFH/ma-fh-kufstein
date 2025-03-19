import express from "express"
import {
  getAllAthletes,
  getAthleteById,
  createAthlete,
  updateAthlete,
  deleteAthlete,
  getAthletesByFederation,
  getAthletesByClub,
  getAthletesByCoach,
} from "../controllers/athleteController"
import { auth, authorize } from "../middleware/auth"

const router = express.Router()

// Public routes
router.get("/", getAllAthletes)
router.get("/:id", getAthleteById)

// Protected routes
router.post(
  "/",
  auth,
  authorize(["clubAdmin", "federalStateAdmin", "stateAdmin", "continentalAdmin", "internationalAdmin"]),
  createAthlete,
)

router.put(
  "/:id",
  auth,
  authorize(["clubAdmin", "federalStateAdmin", "stateAdmin", "continentalAdmin", "internationalAdmin"]),
  updateAthlete,
)

router.delete(
  "/:id",
  auth,
  authorize(["clubAdmin", "federalStateAdmin", "stateAdmin", "continentalAdmin", "internationalAdmin"]),
  deleteAthlete,
)

router.get(
  "/federation/:federationId",
  auth,
  authorize(["federalStateAdmin", "stateAdmin", "continentalAdmin", "internationalAdmin"]),
  getAthletesByFederation,
)

router.get(
  "/club/:clubId",
  auth,
  authorize(["clubAdmin", "federalStateAdmin", "stateAdmin", "continentalAdmin", "internationalAdmin"]),
  getAthletesByClub,
)

router.get("/coach/:coachId", auth, authorize(["coach"]), getAthletesByCoach)

export default router

