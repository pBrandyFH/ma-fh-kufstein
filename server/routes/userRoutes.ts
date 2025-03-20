import express from "express"
import { auth, authorize } from "../middleware/auth"
import type { UserRole } from "../types"

const router = express.Router()

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile retrieved successfully
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
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [athlete, coach, official, clubAdmin, federalStateAdmin, stateAdmin, continentalAdmin, internationalAdmin]
 *       401:
 *         description: Unauthorized
 */
router.get("/me", auth, (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  })
})

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
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
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [athlete, coach, official, clubAdmin, federalStateAdmin, stateAdmin, continentalAdmin, internationalAdmin]
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: User not found
 */
router.get(
  "/:id",
  auth,
  authorize(["clubAdmin", "federalStateAdmin", "stateAdmin", "continentalAdmin", "internationalAdmin"] as UserRole[]),
  (req, res) => {
    // This would call a controller function to get user by ID
    res.status(200).json({
      success: true,
      message: "Get user by ID endpoint",
    })
  },
)

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
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
 *               email:
 *                 type: string
 *                 format: email
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only update own profile
 *       404:
 *         description: User not found
 *       400:
 *         description: Invalid input data
 */
router.put("/:id", auth, (req, res) => {
  // This would call a controller function to update user
  res.status(200).json({
    success: true,
    message: "Update user endpoint",
  })
})

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: User not found
 */
router.delete(
  "/:id",
  auth,
  authorize(["clubAdmin", "federalStateAdmin", "stateAdmin", "continentalAdmin", "internationalAdmin"] as UserRole[]),
  (req, res) => {
    // This would call a controller function to delete user
    res.status(200).json({
      success: true,
      message: "Delete user endpoint",
    })
  },
)

export default router

