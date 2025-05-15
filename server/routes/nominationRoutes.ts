import express from "express"
import { auth, authorize } from "../middleware/auth"
import { UserFederationRole } from "../permissions/types"

const router = express.Router()

/**
 * @swagger
 * /api/nominations:
 *   get:
 *     summary: Get all nominations
 *     tags: [Nominations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all nominations
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
 *                       status:
 *                         type: string
 *                         enum: [pending, approved, rejected]
 *                       submittedBy:
 *                         type: string
 *                       submittedAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  "/",
  auth,
  authorize([
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    
    { role: "SUPERADMIN", federationId: "*" }
  ]),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Get all nominations endpoint",
    })
  }
)

/**
 * @swagger
 * /api/nominations/{id}:
 *   get:
 *     summary: Get nomination by ID
 *     tags: [Nominations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Nomination ID
 *     responses:
 *       200:
 *         description: Nomination details retrieved successfully
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
 *                     status:
 *                       type: string
 *                       enum: [pending, approved, rejected]
 *                     submittedBy:
 *                       type: string
 *                     submittedAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Nomination not found
 */
router.get("/:id", auth, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Get nomination by ID endpoint",
  })
})

/**
 * @swagger
 * /api/nominations:
 *   post:
 *     summary: Create a new nomination
 *     tags: [Nominations]
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
 *             properties:
 *               athleteId:
 *                 type: string
 *               competitionId:
 *                 type: string
 *               weightCategory:
 *                 type: string
 *     responses:
 *       201:
 *         description: Nomination created successfully
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
    
    { role: "SUPERADMIN", federationId: "*" }
  ]),
  (req, res) => {
    res.status(201).json({
      success: true,
      message: "Create nomination endpoint",
    })
  }
)

/**
 * @swagger
 * /api/nominations/{id}/status:
 *   put:
 *     summary: Update nomination status
 *     tags: [Nominations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Nomination ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: Nomination status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Nomination not found
 *       400:
 *         description: Invalid input data
 */
router.put(
  "/:id/status",
  auth,
  authorize([
    { role: "FEDERATION_ADMIN", federationId: "*" },
    
    { role: "SUPERADMIN", federationId: "*" }
  ]),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Update nomination status endpoint",
    })
  }
)

/**
 * @swagger
 * /api/nominations/{id}:
 *   delete:
 *     summary: Delete nomination
 *     tags: [Nominations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Nomination ID
 *     responses:
 *       200:
 *         description: Nomination deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Nomination not found
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
      message: "Delete nomination endpoint",
    })
  }
)

/**
 * @swagger
 * /api/nominations/competition/{competitionId}:
 *   get:
 *     summary: Get nominations by competition
 *     tags: [Nominations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Competition ID
 *     responses:
 *       200:
 *         description: List of nominations for the competition
 *       401:
 *         description: Unauthorized
 */
router.get("/competition/:competitionId", auth, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Get nominations by competition endpoint",
  })
})

/**
 * @swagger
 * /api/nominations/athlete/{athleteId}:
 *   get:
 *     summary: Get nominations by athlete
 *     tags: [Nominations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: athleteId
 *         required: true
 *         schema:
 *           type: string
 *         description: Athlete ID
 *     responses:
 *       200:
 *         description: List of nominations for the athlete
 *       401:
 *         description: Unauthorized
 */
router.get("/athlete/:athleteId", auth, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Get nominations by athlete endpoint",
  })
})

export default router

