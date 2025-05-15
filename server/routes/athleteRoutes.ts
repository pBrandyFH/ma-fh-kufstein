import express from "express";
import {
  getAllAthletes,
  getAthleteById,
  createAthlete,
  updateAthlete,
  deleteAthlete,
  getAthletesByFederation,
  getAthletesByClub,
  getAthletesByCoach,
} from "../controllers/athleteController";
import { auth, authorize } from "../middleware/auth";
import { UserFederationRole } from "../permissions/types";

const router = express.Router();

/**
 * @swagger
 * /api/athletes:
 *   get:
 *     summary: Get all athletes
 *     tags: [Athletes]
 *     responses:
 *       200:
 *         description: List of all athletes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       dateOfBirth:
 *                         type: string
 *                         format: date
 *                       gender:
 *                         type: string
 *                         enum: [male, female, other]
 *                       weightCategory:
 *                         type: string
 *                       clubId:
 *                         type: string
 *                       federationId:
 *                         type: string
 *                       coachId:
 *                         type: string
 */
router.get("/", getAllAthletes);

/**
 * @swagger
 * /api/athletes/{id}:
 *   get:
 *     summary: Get athlete by ID
 *     tags: [Athletes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Athlete ID
 *     responses:
 *       200:
 *         description: Athlete details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     dateOfBirth:
 *                       type: string
 *                       format: date
 *                     gender:
 *                       type: string
 *                       enum: [male, female, other]
 *                     weightCategory:
 *                       type: string
 *                     clubId:
 *                       type: string
 *                     federationId:
 *                       type: string
 *                     coachId:
 *                       type: string
 *       404:
 *         description: Athlete not found
 */
router.get("/:id", getAthleteById);

/**
 * @swagger
 * /api/athletes:
 *   post:
 *     summary: Create a new athlete
 *     tags: [Athletes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - dateOfBirth
 *               - gender
 *               - weightCategory
 *               - clubId
 *               - federationId
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               weightCategory:
 *                 type: string
 *               clubId:
 *                 type: string
 *               federationId:
 *                 type: string
 *               coachId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Athlete created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       400:
 *         description: Invalid input data
 */
router.post(
  "/",
  auth,
  authorize([
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    { role: "SUPERADMIN", federationId: "*" },
  ]),
  createAthlete
);

/**
 * @swagger
 * /api/athletes/{id}:
 *   put:
 *     summary: Update athlete details
 *     tags: [Athletes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Athlete ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               weightCategory:
 *                 type: string
 *               clubId:
 *                 type: string
 *               federationId:
 *                 type: string
 *               coachId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Athlete updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Athlete not found
 *       400:
 *         description: Invalid input data
 */
router.put(
  "/:id",
  auth,
  authorize([
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    { role: "SUPERADMIN", federationId: "*" },
  ]),
  updateAthlete
);

/**
 * @swagger
 * /api/athletes/{id}:
 *   delete:
 *     summary: Delete athlete
 *     tags: [Athletes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Athlete ID
 *     responses:
 *       200:
 *         description: Athlete deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Athlete not found
 */
router.delete(
  "/:id",
  auth,
  authorize([
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    { role: "SUPERADMIN", federationId: "*" },
  ]),
  deleteAthlete
);

/**
 * @swagger
 * /api/athletes/federation/{federationId}:
 *   get:
 *     summary: Get athletes by federation
 *     tags: [Athletes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: federationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Federation ID
 *     responses:
 *       200:
 *         description: List of athletes in the federation
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  "/federation/:federationId",
  auth,
  authorize([
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    { role: "SUPERADMIN", federationId: "*" },
  ]),
  getAthletesByFederation
);

/**
 * @swagger
 * /api/athletes/club/{clubId}:
 *   get:
 *     summary: Get athletes by club
 *     tags: [Athletes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clubId
 *         required: true
 *         schema:
 *           type: string
 *         description: Club ID
 *     responses:
 *       200:
 *         description: List of athletes in the club
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  "/club/:clubId",
  auth,
  authorize([
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    { role: "SUPERADMIN", federationId: "*" },
  ]),
  getAthletesByClub
);

/**
 * @swagger
 * /api/athletes/coach/{coachId}:
 *   get:
 *     summary: Get athletes by coach
 *     tags: [Athletes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: coachId
 *         required: true
 *         schema:
 *           type: string
 *         description: Coach ID
 *     responses:
 *       200:
 *         description: List of athletes coached by the specified coach
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  "/coach/:coachId",
  auth,
  authorize([
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    { role: "SUPERADMIN", federationId: "*" },
  ]),
  getAthletesByCoach
);

export default router;
