import express from "express"
import { auth, authorize } from "../middleware/auth"
import type { UserRole } from "../types"
import Competition from "../models/Competition"
import Nomination from "../models/Nomination"

const router = express.Router()

/**
 * @swagger
 * /api/competitions:
 *   get:
 *     summary: Get all competitions with athlete counts
 *     tags: [Competitions]
 *     responses:
 *       200:
 *         description: List of all competitions with athlete counts
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
 *                       name:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date
 *                       location:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [local, national, international]
 *                       status:
 *                         type: string
 *                         enum: [upcoming, ongoing, completed, cancelled]
 *                       federationId:
 *                         type: string
 *                       officials:
 *                         type: array
 *                         items:
 *                           type: string
 *                       athleteCount:
 *                         type: number
 */
router.get("/", async (req, res) => {
  try {
    const competitions = await Competition.find()
      .populate("hostFederationId", "name")
      .populate("hostClubId", "name")
      .sort({ startDate: -1 });

    // Get athlete counts for each competition
    const competitionsWithCounts = await Promise.all(
      competitions.map(async (competition) => {
        const athleteCount = await Nomination.countDocuments({
          competitionId: competition._id,
          status: "approved"
        });

        return {
          ...competition.toObject(),
          athleteCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: competitionsWithCounts
    });
  } catch (error) {
    console.error("Error fetching competitions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch competitions"
    });
  }
});

/**
 * @swagger
 * /api/competitions/{id}:
 *   get:
 *     summary: Get competition by ID
 *     tags: [Competitions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Competition ID
 *     responses:
 *       200:
 *         description: Competition details retrieved successfully
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
 *                     name:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date
 *                     location:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [local, national, international]
 *                     status:
 *                       type: string
 *                       enum: [upcoming, ongoing, completed, cancelled]
 *                     federationId:
 *                       type: string
 *                     officials:
 *                       type: array
 *                       items:
 *                         type: string
 *       404:
 *         description: Competition not found
 */
router.get("/:id", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Get competition by ID endpoint",
  })
})

/**
 * @swagger
 * /api/competitions:
 *   post:
 *     summary: Create a new competition
 *     tags: [Competitions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - date
 *               - location
 *               - type
 *               - federationId
 *             properties:
 *               name:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               location:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [local, national, international]
 *               status:
 *                 type: string
 *                 enum: [upcoming, ongoing, completed, cancelled]
 *               federationId:
 *                 type: string
 *               officials:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Competition created successfully
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
  authorize(["federalStateAdmin", "stateAdmin", "continentalAdmin", "internationalAdmin"] as UserRole[]),
  (req, res) => {
    res.status(201).json({
      success: true,
      message: "Create competition endpoint",
    })
  },
)

/**
 * @swagger
 * /api/competitions/{id}:
 *   put:
 *     summary: Update competition details
 *     tags: [Competitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Competition ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               location:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [local, national, international]
 *               status:
 *                 type: string
 *                 enum: [upcoming, ongoing, completed, cancelled]
 *               federationId:
 *                 type: string
 *               officials:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Competition updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Competition not found
 *       400:
 *         description: Invalid input data
 */
router.put(
  "/:id",
  auth,
  authorize(["federalStateAdmin", "stateAdmin", "continentalAdmin", "internationalAdmin"] as UserRole[]),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Update competition endpoint",
    })
  },
)

/**
 * @swagger
 * /api/competitions/{id}:
 *   delete:
 *     summary: Delete competition
 *     tags: [Competitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Competition ID
 *     responses:
 *       200:
 *         description: Competition deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Competition not found
 */
router.delete(
  "/:id",
  auth,
  authorize(["federalStateAdmin", "stateAdmin", "continentalAdmin", "internationalAdmin"] as UserRole[]),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Delete competition endpoint",
    })
  },
)

/**
 * @swagger
 * /api/competitions/federation/{federationId}:
 *   get:
 *     summary: Get competitions by federation
 *     tags: [Competitions]
 *     parameters:
 *       - in: path
 *         name: federationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Federation ID
 *     responses:
 *       200:
 *         description: List of competitions in the federation
 */
router.get("/federation/:federationId", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Get competitions by federation endpoint",
  })
})

/**
 * @swagger
 * /api/competitions/international:
 *   get:
 *     summary: Get international competitions
 *     tags: [Competitions]
 *     responses:
 *       200:
 *         description: List of international competitions
 */
router.get("/international", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Get international competitions endpoint",
  })
})

/**
 * @swagger
 * /api/competitions/upcoming:
 *   get:
 *     summary: Get upcoming competitions
 *     tags: [Competitions]
 *     responses:
 *       200:
 *         description: List of upcoming competitions
 */
router.get("/upcoming", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Get upcoming competitions endpoint",
  })
})

/**
 * @swagger
 * /api/competitions/assigned/{userId}:
 *   get:
 *     summary: Get competitions assigned to an official
 *     tags: [Competitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Official's user ID
 *     responses:
 *       200:
 *         description: List of competitions assigned to the official
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not an official
 */
router.get("/assigned/:userId", auth, authorize(["official"] as UserRole[]), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Get assigned competitions endpoint",
  })
})

export default router

