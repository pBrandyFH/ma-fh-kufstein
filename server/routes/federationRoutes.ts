import express from "express"
import {
  getAllFederations,
  getFederationById,
  createFederation,
  updateFederation,
  deleteFederation,
  getFederationsByType,
  getFederationsByParent,
  getChildFederations,
} from "../controllers/federationController"
import { auth, authorize } from "../middleware/auth"

const router = express.Router()

// Public routes
router.get("/", getAllFederations)
router.get("/:id", getFederationById)
router.get("/type/:type", getFederationsByType)
router.get("/parent/:parentId", getFederationsByParent)
router.get("/:id/children", getChildFederations)

// Protected routes
router.post("/", auth, authorize(["stateAdmin", "continentalAdmin", "internationalAdmin"]), createFederation)

router.put(
  "/:id",
  auth,
  authorize(["federalStateAdmin", "stateAdmin", "continentalAdmin", "internationalAdmin"]),
  updateFederation,
)

router.delete("/:id", auth, authorize(["stateAdmin", "continentalAdmin", "internationalAdmin"]), deleteFederation)

export default router

