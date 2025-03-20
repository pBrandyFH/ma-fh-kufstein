import express from "express"
import {
  getAllFederations,
  getFederationById,
  createFederation,
  updateFederation,
  deleteFederation,
  getFederationsByType,
  getFederationsByParent,
  getChildFederations,
} from "../controllers/federationController"
import { auth, authorize } from "../middleware/auth"

const router = express.Router()

/**
 * @swagger
 * /api/federations:
 *   get:
 *     summary: Get all federations
 *     tags: [Federations]
 *     responses:
 *       200:
 *         description: List of all federations
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
 *                       type:
 *                         type: string
 *                         enum: [federalState, state, continental, international]
 *                       parentId:
 *                         type: string
 *                       country:
 *                         type: string
 *                       region:
 *                         type: string
 */
router.get("/", getAllFederations)

/**
 * @swagger
 * /api/federations/{id}:
 *   get:
 *     summary: Get federation by ID
 *     tags: [Federations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Federation ID
 *     responses:
 *       200:
 *         description: Federation details retrieved successfully
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
 *                     type:
 *                       type: string
 *                       enum: [federalState, state, continental, international]
 *                     parentId:
 *                       type: string
 *                     country:
 *                       type: string
 *                     region:
 *                       type: string
 *       404:
 *         description: Federation not found
 */
router.get("/:id", getFederationById)

/**
 * @swagger
 * /api/federations/type/{type}:
 *   get:
 *     summary: Get federations by type
 *     tags: [Federations]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [federalState, state, continental, international]
 *         description: Federation type
 *     responses:
 *       200:
 *         description: List of federations of the specified type
 */
router.get("/type/:type", getFederationsByType)

/**
 * @swagger
 * /api/federations/parent/{parentId}:
 *   get:
 *     summary: Get federations by parent ID
 *     tags: [Federations]
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Parent federation ID
 *     responses:
 *       200:
 *         description: List of child federations
 */
router.get("/parent/:parentId", getFederationsByParent)

/**
 * @swagger
 * /api/federations/{id}/children:
 *   get:
 *     summary: Get child federations
 *     tags: [Federations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Parent federation ID
 *     responses:
 *       200:
 *         description: List of child federations
 */
router.get("/:id/children", getChildFederations)

/**
 * @swagger
 * /api/federations:
 *   post:
 *     summary: Create a new federation
 *     tags: [Federations]
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
 *               - type
 *               - country
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [federalState, state, continental, international]
 *               parentId:
 *                 type: string
 *               country:
 *                 type: string
 *               region:
 *                 type: string
 *     responses:
 *       201:
 *         description: Federation created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       400:
 *         description: Invalid input data
 */
router.post("/", auth, authorize(["stateAdmin", "continentalAdmin", "internationalAdmin"]), createFederation)

/**
 * @swagger
 * /api/federations/{id}:
 *   put:
 *     summary: Update federation details
 *     tags: [Federations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Federation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [federalState, state, continental, international]
 *               parentId:
 *                 type: string
 *               country:
 *                 type: string
 *               region:
 *                 type: string
 *     responses:
 *       200:
 *         description: Federation updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Federation not found
 *       400:
 *         description: Invalid input data
 */
router.put(
  "/:id",
  auth,
  authorize(["federalStateAdmin", "stateAdmin", "continentalAdmin", "internationalAdmin"]),
  updateFederation,
)

/**
 * @swagger
 * /api/federations/{id}:
 *   delete:
 *     summary: Delete federation
 *     tags: [Federations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Federation ID
 *     responses:
 *       200:
 *         description: Federation deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Federation not found
 */
router.delete("/:id", auth, authorize(["stateAdmin", "continentalAdmin", "internationalAdmin"]), deleteFederation)

export default router

