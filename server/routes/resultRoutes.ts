import express from "express"
import { auth, authorize } from "../middleware/auth"
import { saveWeighIn, saveAttempt, getResultsByCompetitionAndFlight, getResultsByCompetitionAndAthletes } from "../controllers/resultController"
import Result from "../models/Result"
import type { IAthlete } from "../models/Athlete"

const router = express.Router()

/**
 * @swagger
 * /api/results:
 *   get:
 *     summary: Get all results
 *     tags: [Results]
 *     responses:
 *       200:
 *         description: List of all results
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
 *                       athleteId:
 *                         type: string
 *                       competitionId:
 *                         type: string
 *                       weightCategory:
 *                         type: string
 *                       snatch:
 *                         type: object
 *                         properties:
 *                           first:
 *                             type: number
 *                           second:
 *                             type: number
 *                           third:
 *                             type: number
 *                       cleanAndJerk:
 *                         type: object
 *                         properties:
 *                           first:
 *                             type: number
 *                           second:
 *                             type: number
 *                           third:
 *                             type: number
 *                       total:
 *                         type: number
 *                       rank:
 *                         type: number
 *                       bodyWeight:
 *                         type: number
 *                       bodyWeightCategory:
 *                         type: string
 */
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Get all results endpoint",
  })
})

/**
 * @swagger
 * /api/results/{id}:
 *   get:
 *     summary: Get result by ID
 *     tags: [Results]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Result ID
 *     responses:
 *       200:
 *         description: Result details retrieved successfully
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
 *                     athleteId:
 *                       type: string
 *                     competitionId:
 *                       type: string
 *                     weightCategory:
 *                       type: string
 *                     snatch:
 *                       type: object
 *                       properties:
 *                         first:
 *                           type: number
 *                         second:
 *                           type: number
 *                         third:
 *                           type: number
 *                     cleanAndJerk:
 *                       type: object
 *                       properties:
 *                         first:
 *                           type: number
 *                         second:
 *                           type: number
 *                         third:
 *                           type: number
 *                     total:
 *                       type: number
 *                     rank:
 *                       type: number
 *                     bodyWeight:
 *                       type: number
 *                     bodyWeightCategory:
 *                       type: string
 *       404:
 *         description: Result not found
 */
router.get("/:id", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Get result by ID endpoint",
  })
})

/**
 * @swagger
 * /api/results:
 *   post:
 *     summary: Create a new result (official only)
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - athleteId
 *               - competitionId
 *               - weightCategory
 *               - bodyWeight
 *             properties:
 *               athleteId:
 *                 type: string
 *               competitionId:
 *                 type: string
 *               weightCategory:
 *                 type: string
 *               bodyWeight:
 *                 type: number
 *               snatch:
 *                 type: object
 *                 properties:
 *                   first:
 *                     type: number
 *                   second:
 *                     type: number
 *                   third:
 *                     type: number
 *               cleanAndJerk:
 *                 type: object
 *                 properties:
 *                   first:
 *                     type: number
 *                   second:
 *                     type: number
 *                   third:
 *                     type: number
 *     responses:
 *       201:
 *         description: Result created successfully
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
    { role: "ATHLETE", federationId: "*" },
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    
    { role: "SUPERADMIN", federationId: "*" }
  ]),
  (req, res) => {
    res.status(201).json({
      success: true,
      message: "Create result endpoint",
    })
  }
)

/**
 * @swagger
 * /api/results/{id}:
 *   put:
 *     summary: Update result (official only)
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Result ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               snatch:
 *                 type: object
 *                 properties:
 *                   first:
 *                     type: number
 *                   second:
 *                     type: number
 *                   third:
 *                     type: number
 *               cleanAndJerk:
 *                 type: object
 *                 properties:
 *                   first:
 *                     type: number
 *                   second:
 *                     type: number
 *                   third:
 *                     type: number
 *               bodyWeight:
 *                 type: number
 *     responses:
 *       200:
 *         description: Result updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Result not found
 *       400:
 *         description: Invalid input data
 */
router.put(
  "/:id",
  auth,
  authorize([
    { role: "ATHLETE", federationId: "*" },
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    
    { role: "SUPERADMIN", federationId: "*" }
  ]),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Update result endpoint",
    })
  }
)

/**
 * @swagger
 * /api/results/{id}:
 *   delete:
 *     summary: Delete result (admin only)
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Result ID
 *     responses:
 *       200:
 *         description: Result deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Result not found
 */
router.delete(
  "/:id",
  auth,
  authorize([
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    
    { role: "SUPERADMIN", federationId: "*" }
  ]),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Delete result endpoint",
    })
  }
)

/**
 * @swagger
 * /api/results/competition/{competitionId}:
 *   get:
 *     summary: Get results by competition
 *     tags: [Results]
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Competition ID
 *     responses:
 *       200:
 *         description: List of results for the competition
 */
router.get(
  "/competition/:competitionId",
  async (req, res) => {
    try {
      const { competitionId } = req.params;
      const results = await Result.find({ competitionId })
        .populate<{ athleteId: IAthlete }>({
          path: "athleteId",
          select: "firstName lastName gender",
          model: "Athlete"
        })
        .sort({ 
          "athleteId.gender": 1,
          weightCategory: 1,
          ageCategory: 1,
          total: -1
        });

      // Group results by gender, weight category, and age category
      const groupedResults = results.reduce((acc, result) => {
        const athlete = result.athleteId as unknown as IAthlete;
        const gender = athlete?.gender || 'male';
        const weightCategory = result.weightCategory;
        const ageCategory = result.ageCategory;
        
        if (!acc[gender]) {
          acc[gender] = {};
        }
        if (!acc[gender][weightCategory]) {
          acc[gender][weightCategory] = {};
        }
        if (!acc[gender][weightCategory][ageCategory]) {
          acc[gender][weightCategory][ageCategory] = [];
        }
        
        acc[gender][weightCategory][ageCategory].push(result);
        return acc;
      }, {} as Record<string, Record<string, Record<string, typeof results>>>);

      res.status(200).json({
        success: true,
        data: groupedResults,
      });
    } catch (error) {
      console.error("Error fetching results:", error);
      res.status(500).json({
        success: false,
        error: "Server error while fetching results",
      });
    }
  }
)

/**
 * @swagger
 * /api/results/athlete/{athleteId}:
 *   get:
 *     summary: Get results by athlete
 *     tags: [Results]
 *     parameters:
 *       - in: path
 *         name: athleteId
 *         required: true
 *         schema:
 *           type: string
 *         description: Athlete ID
 *     responses:
 *       200:
 *         description: List of results for the athlete
 */
router.get(
  "/athlete/:athleteId",
  auth,
  authorize([
    { role: "ATHLETE", federationId: "*" },
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    
    { role: "SUPERADMIN", federationId: "*" }
  ]),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Get results by athlete endpoint",
    })
  }
)

/**
 * @swagger
 * /api/results/{id}/attempt:
 *   put:
 *     summary: Update attempt for a lift
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Result ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - liftType
 *               - attemptNumber
 *               - weight
 *             properties:
 *               liftType:
 *                 type: string
 *                 enum: [snatch, cleanAndJerk]
 *               attemptNumber:
 *                 type: number
 *                 enum: [1, 2, 3]
 *               weight:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [good, noGood, notAttempted]
 *     responses:
 *       200:
 *         description: Attempt updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Result not found
 *       400:
 *         description: Invalid input data
 */
router.put(
  "/:id/attempt",
  auth,
  authorize([
    { role: "ATHLETE", federationId: "*" },
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    
    { role: "SUPERADMIN", federationId: "*" }
  ]),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Update attempt endpoint",
    })
  }
)

/**
 * @swagger
 * /api/results/rankings/competition/{competitionId}:
 *   get:
 *     summary: Calculate rankings for a competition
 *     tags: [Results]
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Competition ID
 *     responses:
 *       200:
 *         description: Rankings calculated successfully
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
 *                       rank:
 *                         type: number
 *                       athleteId:
 *                         type: string
 *                       athleteName:
 *                         type: string
 *                       weightCategory:
 *                         type: string
 *                       snatch:
 *                         type: number
 *                       cleanAndJerk:
 *                         type: number
 *                       total:
 *                         type: number
 *                       bodyWeight:
 *                         type: number
 */
router.get("/rankings/competition/:competitionId", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Calculate rankings endpoint",
  })
})

/**
 * @swagger
 * /api/results/federation/{federationId}:
 *   get:
 *     summary: Get results by federation
 *     tags: [Results]
 *     parameters:
 *       - in: path
 *         name: federationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Federation ID
 *     responses:
 *       200:
 *         description: List of results for the federation
 */
router.get(
  "/federation/:federationId",
  auth,
  authorize([
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    
    { role: "SUPERADMIN", federationId: "*" }
  ]),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Get results by federation endpoint",
    })
  }
)

/**
 * @swagger
 * /api/results/club/{clubId}:
 *   get:
 *     summary: Get results by club
 *     tags: [Results]
 *     parameters:
 *       - in: path
 *         name: clubId
 *         required: true
 *         schema:
 *           type: string
 *         description: Club ID
 *     responses:
 *       200:
 *         description: List of results for the club
 */
router.get(
  "/club/:clubId",
  auth,
  authorize([
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    
    { role: "SUPERADMIN", federationId: "*" }
  ]),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Get results by club endpoint",
    })
  }
)

/**
 * @swagger
 * /api/results/weigh-in:
 *   post:
 *     summary: Save weigh-in data for an athlete
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - athleteId
 *               - competitionId
 *               - bodyweight
 *               - lotNumber
 *               - startWeights
 *             properties:
 *               athleteId:
 *                 type: string
 *               competitionId:
 *                 type: string
 *               bodyweight:
 *                 type: number
 *               lotNumber:
 *                 type: number
 *               startWeights:
 *                 type: object
 *                 properties:
 *                   squat:
 *                     type: number
 *                   bench:
 *                     type: number
 *                   deadlift:
 *                     type: number
 *               flightNumber:
 *                 type: number
 *               groupNumber:
 *                 type: number
 */
router.post(
  "/weigh-in",
  auth,
  authorize([
    { role: "ATHLETE", federationId: "*" },
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    { role: "SUPERADMIN", federationId: "*" }
  ]),
  saveWeighIn
)

/**
 * @swagger
 * /api/results/attempt:
 *   post:
 *     summary: Save attempt data for an athlete
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - athleteId
 *               - competitionId
 *               - liftType
 *               - attemptNumber
 *               - weight
 *             properties:
 *               athleteId:
 *                 type: string
 *               competitionId:
 *                 type: string
 *               liftType:
 *                 type: string
 *                 enum: [squat, bench, deadlift]
 *               attemptNumber:
 *                 type: number
 *                 enum: [1, 2, 3]
 *               weight:
 *                 type: number
 *               flightNumber:
 *                 type: number
 *               groupNumber:
 *                 type: number
 */
router.post(
  "/attempt",
  auth,
  authorize([
    { role: "ATHLETE", federationId: "*" },
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    { role: "SUPERADMIN", federationId: "*" }
  ]),
  saveAttempt
)

/**
 * @swagger
 * /api/results/competition/{competitionId}/flight/{flightNumber}/group/{groupNumber}:
 *   get:
 *     summary: Get results for a specific competition, flight, and group
 *     tags: [Results]
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: flightNumber
 *         required: true
 *         schema:
 *           type: number
 *       - in: path
 *         name: groupNumber
 *         required: true
 *         schema:
 *           type: number
 */
router.get(
  "/competition/:competitionId/flight/:flightNumber/group/:groupNumber",
  auth,
  authorize([
    { role: "ATHLETE", federationId: "*" },
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    { role: "SUPERADMIN", federationId: "*" }
  ]),
  getResultsByCompetitionAndFlight
)

/**
 * @swagger
 * /api/results/competition/{competitionId}/athletes:
 *   post:
 *     summary: Get results for multiple athletes in a competition
 *     tags: [Results]
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - athleteIds
 *             properties:
 *               athleteIds:
 *                 type: array
 *                 items:
 *                   type: string
 */
router.post(
  "/competition/:competitionId/athletes",
  auth,
  authorize([
    { role: "ATHLETE", federationId: "*" },
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    { role: "SUPERADMIN", federationId: "*" }
  ]),
  getResultsByCompetitionAndAthletes
)

export default router

