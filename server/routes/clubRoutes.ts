import express from "express"
import {
  getAllClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
  getClubsByFederation,
} from "../controllers/clubController"
import { auth, authorize } from "../middleware/auth"

const router = express.Router()

// Public routes
router.get("/", getAllClubs)
router.get("/:id", getClubById)
router.get("/federation/:federationId", getClubsByFederation)

// Protected routes
router.post(
  "/",
  auth,
  authorize(["federalStateAdmin", "stateAdmin", "continentalAdmin", "internationalAdmin"]),
  createClub,
)

router.put(
  "/:id",
  auth,
  authorize(["clubAdmin", "federalStateAdmin", "stateAdmin", "continentalAdmin", "internationalAdmin"]),
  updateClub,
)

router.delete(
  "/:id",
  auth,
  authorize(["federalStateAdmin", "stateAdmin", "continentalAdmin", "internationalAdmin"]),
  deleteClub,
)

export default router

