import express from "express";
import {
  register,
  login,
  sendInvite,
  getAllInvitations,
  getMyInvitations,
  resendInvitation,
  deleteInvitation,
  validateInviteCode,
} from "../controllers/authController";
import { auth, authorize } from "../middleware/auth";
import { RoleType } from "../permissions/types";

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - inviteCode
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               inviteCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or user already exists
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/validate-invite:
 *   post:
 *     summary: Validate an invite code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inviteCode
 *               - email
 *             properties:
 *               inviteCode:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Invite code is valid
 *       400:
 *         description: Invalid or expired invite code
 */
router.post("/validate-invite", validateInviteCode);

/**
 * @swagger
 * /api/auth/invite:
 *   post:
 *     summary: Send an invitation to a new user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *               - federationId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [ATHLETE, CLUB_ADMIN, STATE_ADMIN, NATIONAL_ADMIN, SUPERADMIN]
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               federationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invitation sent successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid input or user already exists
 */
router.post(
  "/invite",
  auth,
  authorize([
    { role: "CLUB_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },

    { role: "SUPERADMIN", federationId: "*" },
  ]),
  sendInvite
);

/**
 * @swagger
 * /api/auth/invitations:
 *   get:
 *     summary: Get all invitations (admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all invitations
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/invitations",
  auth,
  authorize([{ role: "SUPERADMIN", federationId: "*" }]),
  getAllInvitations
);

/**
 * @swagger
 * /api/auth/my-invitations:
 *   get:
 *     summary: Get invitations sent by the current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of invitations sent by the user
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/my-invitations",
  auth,
  authorize([
    { role: "CLUB_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },

    { role: "SUPERADMIN", federationId: "*" },
  ]),
  getMyInvitations
);

/**
 * @swagger
 * /api/auth/invitations/{id}/resend:
 *   post:
 *     summary: Resend an invitation
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation resent successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invitation not found
 */
router.post(
  "/invitations/:id/resend",
  auth,
  authorize([
    { role: "CLUB_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    { role: "SUPERADMIN", federationId: "*" },
  ]),
  resendInvitation
);

/**
 * @swagger
 * /api/auth/invitations/{id}:
 *   delete:
 *     summary: Delete an invitation
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invitation not found
 */
router.delete(
  "/invitations/:id",
  auth,
  authorize([
    { role: "CLUB_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    { role: "SUPERADMIN", federationId: "*" },
  ]),
  deleteInvitation
);

export default router;
