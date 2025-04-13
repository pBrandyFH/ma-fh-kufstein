import express from "express";
import { auth } from "../middleware/auth";
import { getPermissions } from "../middleware/permissions";

const router = express.Router();

/**
 * @swagger
 * /api/permissions:
 *   get:
 *     summary: Get user permissions for a federation
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: federationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Federation ID
 *     responses:
 *       200:
 *         description: Permissions retrieved successfully
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
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.get("/", auth, getPermissions);

export default router; 