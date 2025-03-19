import express from "express"
import {
  register,
  login,
  sendInvite,
  getAllInvitations,
  getMyInvitations,
  resendInvitation,
  deleteInvitation,
  validateInviteCode,
} from "../controllers/authController"
import { auth, authorize } from "../middleware/auth"

const router = express.Router()

// Public routes
router.post("/register", register)
router.post("/login", login)
router.post("/validate-invite", validateInviteCode)

// Protected routes
router.post(
  "/invite",
  auth,
  authorize(["clubAdmin", "federalStateAdmin", "stateAdmin", "continentalAdmin", "internationalAdmin"]),
  sendInvite,
)

router.get("/invitations", auth, authorize(["internationalAdmin"]), getAllInvitations)

router.get(
  "/my-invitations",
  auth,
  authorize(["clubAdmin", "federalStateAdmin", "stateAdmin", "continentalAdmin", "internationalAdmin"]),
  getMyInvitations,
)

router.post(
  "/invitations/:id/resend",
  auth,
  authorize(["clubAdmin", "federalStateAdmin", "stateAdmin", "continentalAdmin", "internationalAdmin"]),
  resendInvitation,
)

router.delete(
  "/invitations/:id",
  auth,
  authorize(["clubAdmin", "federalStateAdmin", "stateAdmin", "continentalAdmin", "internationalAdmin"]),
  deleteInvitation,
)

export default router

