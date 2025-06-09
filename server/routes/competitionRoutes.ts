import express from "express";
import { auth, authorize } from "../middleware/auth";
import { UserFederationRole } from "../permissions/types";
import Competition from "../models/Competition";
import Nomination from "../models/Nomination";
import {
  createCompetition,
  getCompetitionById,
  getCompetitionsByHostFederation,
  getInternationalCompetitions,
  getNationalCompetitions,
  updateCompetition,
} from "../controllers/competitionController";

const router = express.Router();

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
      .populate("hostFederation", "name")
      .populate("hostMember", "name")
      .sort({ startDate: -1 });

    // Get athlete counts for each competition
    const competitionsWithCounts = await Promise.all(
      competitions.map(async (competition) => {
        const athleteCount = await Nomination.countDocuments({
          competitionId: competition._id,
          status: "approved",
        });

        return {
          ...competition.toObject(),
          athleteCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: competitionsWithCounts,
    });
  } catch (error) {
    console.error("Error fetching competitions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch competitions",
    });
  }
});

/**
 * @swagger
 * /api/competitions/eligible:
 *   get:
 *     summary: Get competitions that the current user's federation is eligible to participate in
 *     tags: [Competitions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of eligible competitions
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
 *                     $ref: '#/components/schemas/Competition'
 */
router.get("/eligible", auth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    // Get the user's federation ID from their federation roles
    const userFederationId = user.federationRoles?.[0]?.federationId;

    // Find competitions where the user's federation is eligible
    const competitions = await Competition.find({
      eligibleFederationIds: { $in: [userFederationId] },
    })
      .populate("hostFederationId", "name type")
      .populate("hostClubId", "name")
      .sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      data: competitions,
    });
  } catch (error) {
    console.error("Error fetching eligible competitions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch eligible competitions",
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
router.get("/:id", getCompetitionById);

router.get("/federation/:federationId", getCompetitionsByHostFederation);

router.get("/international/:federationId", getInternationalCompetitions);

router.get("/national/:federationId", getNationalCompetitions);

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
  authorize([
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },

    { role: "SUPERADMIN", federationId: "*" },
  ]),
  createCompetition
);

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
  authorize([
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    { role: "SUPERADMIN", federationId: "*" },
  ]),
  updateCompetition
);

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
  authorize([
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },

    { role: "SUPERADMIN", federationId: "*" },
  ]),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Delete competition endpoint",
    });
  }
);

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
  });
});

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
  });
});

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
  });
});

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
router.get(
  "/assigned/:userId",
  auth,
  authorize([{ role: "ATHLETE", federationId: "*" }]),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Get assigned competitions endpoint",
    });
  }
);

router.post(
  "/:id/officials",
  auth,
  authorize([
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },

    { role: "SUPERADMIN", federationId: "*" },
  ]),
  async (req, res) => {
    // ... existing code ...
  }
);

export default router;
