import type { Request, Response } from "express"
import mongoose from "mongoose"
import Federation from "../models/Federation"
import User from "../models/User"
import { sendInviteEmail } from "../utils/emailService"
import { AuthenticatedRequest } from "./authController"
import { FederationType } from "../types"

interface CreateFederationRequestBody {
  name: string
  abbreviation: string
  type: FederationType
  parentFederation?: mongoose.Types.ObjectId
  adminId?: mongoose.Types.ObjectId
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  address?: string
  city?: string
  country?: string
}

interface UpdateFederationRequestBody extends Partial<CreateFederationRequestBody> {}

// Get all federations
export const getAllFederations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const federations = await Federation.find()
      .populate<{ parentFederation: { name: string; abbreviation: string; type: FederationType } }>("parentFederation", "name abbreviation type")

    res.status(200).json({
      success: true,
      data: federations,
    })
  } catch (error) {
    console.error("Get all federations error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while fetching federations",
    })
  }
}

// Get federation by ID
export const getFederationById = async (req: AuthenticatedRequest<{ id: string }>, res: Response) => {
  try {
    const federation = await Federation.findById(req.params.id)
      .populate<{ parentFederation: { name: string; abbreviation: string; type: FederationType } }>("parentFederation", "name abbreviation type")
      .populate<{ adminId: { firstName: string; lastName: string; email: string } }>("adminId", "firstName lastName email")

    if (!federation) {
      return res.status(404).json({
        success: false,
        error: "Federation not found",
      })
    }

    res.status(200).json({
      success: true,
      data: federation,
    })
  } catch (error) {
    console.error("Get federation by ID error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while fetching federation",
    })
  }
}

// Create new federation
export const createFederation = async (
  req: AuthenticatedRequest<{}, {}, CreateFederationRequestBody>,
  res: Response
) => {
  try {
    const {
      name,
      abbreviation,
      type,
      parentFederation,
      adminId,
      contactName,
      contactEmail,
      contactPhone,
      website,
      address,
      city,
      country,
    } = req.body

    const federation = new Federation({
      name,
      abbreviation,
      type,
      parentFederation,
      adminId,
      contactName,
      contactEmail,
      contactPhone,
      website,
      address,
      city,
      country,
    })

    await federation.save()

    res.status(201).json({
      success: true,
      data: federation,
    })
  } catch (error) {
    console.error("Create federation error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while creating federation",
    })
  }
}

// Update federation
export const updateFederation = async (
  req: AuthenticatedRequest<{ id: string }, {}, UpdateFederationRequestBody>,
  res: Response
) => {
  try {
    const federation = await Federation.findById(req.params.id)

    if (!federation) {
      return res.status(404).json({
        success: false,
        error: "Federation not found",
      })
    }

    const updatedFederation = await Federation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    res.status(200).json({
      success: true,
      data: updatedFederation,
    })
  } catch (error) {
    console.error("Update federation error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while updating federation",
    })
  }
}

// Delete federation
export const deleteFederation = async (req: AuthenticatedRequest<{ id: string }>, res: Response) => {
  try {
    const federation = await Federation.findById(req.params.id)

    if (!federation) {
      return res.status(404).json({
        success: false,
        error: "Federation not found",
      })
    }

    await federation.deleteOne()

    res.status(200).json({
      success: true,
      message: "Federation deleted successfully",
    })
  } catch (error) {
    console.error("Delete federation error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while deleting federation",
    })
  }
}

// Get federations by type
export const getFederationsByType = async (
  req: AuthenticatedRequest<{ type: FederationType }>,
  res: Response
) => {
  try {
    const federations = await Federation.find({ type: req.params.type })
      .populate<{ parentFederation: { name: string; abbreviation: string; type: FederationType } }>("parentFederation", "name abbreviation type")

    res.status(200).json({
      success: true,
      data: federations,
    })
  } catch (error) {
    console.error("Get federations by type error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while fetching federations",
    })
  }
}

// Get federations by parent
export const getFederationsByParent = async (
  req: AuthenticatedRequest<{ parentId: string }>,
  res: Response
) => {
  try {
    const federations = await Federation.find({ parentFederation: req.params.parentId })
      .populate<{ parentFederation: { name: string; abbreviation: string; type: FederationType } }>("parentFederation", "name abbreviation type")

    res.status(200).json({
      success: true,
      data: federations,
    })
  } catch (error) {
    console.error("Get federations by parent error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while fetching federations",
    })
  }
}

// Get child federations
export const getChildFederations = async (req: AuthenticatedRequest<{ id: string }>, res: Response) => {
  try {
    const childFederations = await Federation.find({ parentFederation: req.params.id })
      .populate<{ parentFederation: { name: string; abbreviation: string; type: FederationType } }>("parentFederation", "name abbreviation type")

    res.status(200).json({
      success: true,
      data: childFederations,
    })
  } catch (error) {
    console.error("Get child federations error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while fetching child federations",
    })
  }
}

