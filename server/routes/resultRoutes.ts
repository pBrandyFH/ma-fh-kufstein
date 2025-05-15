import express from "express"
import { auth, authorize } from "../middleware/auth"
import { UserFederationRole } from "../permissions/types"

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
      message: "Get results by competition endpoint",
    })
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

export default router

