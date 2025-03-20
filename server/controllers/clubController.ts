import type { Request, Response } from "express"
import mongoose from "mongoose"
import Club from "../models/Club"
import User from "../models/User"
import { sendInviteEmail } from "../utils/emailService"
import { AuthenticatedRequest } from "./authController"

interface CreateClubRequestBody {
  name: string
  abbreviation: string
  federationId: mongoose.Types.ObjectId
  adminId?: mongoose.Types.ObjectId
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  address?: string
  city?: string
  country?: string
}

interface UpdateClubRequestBody extends Partial<CreateClubRequestBody> {}

// Get all clubs
export const getAllClubs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clubs = await Club.find()
      .populate<{ federationId: { name: string; abbreviation: string; type: string } }>("federationId", "name abbreviation type")
      .populate<{ adminId: { firstName: string; lastName: string; email: string } }>("adminId", "firstName lastName email")

    res.status(200).json({
      success: true,
      data: clubs,
    })
  } catch (error) {
    console.error("Get all clubs error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while fetching clubs",
    })
  }
}

// Get club by ID
export const getClubById = async (req: AuthenticatedRequest<{ id: string }>, res: Response) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate<{ federationId: { name: string; abbreviation: string; type: string } }>("federationId", "name abbreviation type")
      .populate<{ adminId: { firstName: string; lastName: string; email: string } }>("adminId", "firstName lastName email")

    if (!club) {
      return res.status(404).json({
        success: false,
        error: "Club not found",
      })
    }

    res.status(200).json({
      success: true,
      data: club,
    })
  } catch (error) {
    console.error("Get club by ID error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while fetching club",
    })
  }
}

// Create new club
export const createClub = async (
  req: AuthenticatedRequest<{}, {}, CreateClubRequestBody>,
  res: Response
) => {
  try {
    const {
      name,
      abbreviation,
      federationId,
      adminId,
      contactName,
      contactEmail,
      contactPhone,
      website,
      address,
      city,
      country,
    } = req.body

    const club = new Club({
      name,
      abbreviation,
      federationId,
      adminId,
      contactName,
      contactEmail,
      contactPhone,
      website,
      address,
      city,
      country,
    })

    await club.save()

    res.status(201).json({
      success: true,
      data: club,
    })
  } catch (error) {
    console.error("Create club error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while creating club",
    })
  }
}

// Update club
export const updateClub = async (
  req: AuthenticatedRequest<{ id: string }, {}, UpdateClubRequestBody>,
  res: Response
) => {
  try {
    const club = await Club.findById(req.params.id)

    if (!club) {
      return res.status(404).json({
        success: false,
        error: "Club not found",
      })
    }

    const updatedClub = await Club.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    res.status(200).json({
      success: true,
      data: updatedClub,
    })
  } catch (error) {
    console.error("Update club error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while updating club",
    })
  }
}

// Delete club
export const deleteClub = async (req: AuthenticatedRequest<{ id: string }>, res: Response) => {
  try {
    const club = await Club.findById(req.params.id)

    if (!club) {
      return res.status(404).json({
        success: false,
        error: "Club not found",
      })
    }

    await club.deleteOne()

    res.status(200).json({
      success: true,
      message: "Club deleted successfully",
    })
  } catch (error) {
    console.error("Delete club error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while deleting club",
    })
  }
}

// Get clubs by federation
export const getClubsByFederation = async (
  req: AuthenticatedRequest<{ federationId: string }>,
  res: Response
) => {
  try {
    const clubs = await Club.find({ federationId: req.params.federationId })
      .populate<{ federationId: { name: string; abbreviation: string; type: string } }>("federationId", "name abbreviation type")
      .populate<{ adminId: { firstName: string; lastName: string; email: string } }>("adminId", "firstName lastName email")

    res.status(200).json({
      success: true,
      data: clubs,
    })
  } catch (error) {
    console.error("Get clubs by federation error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while fetching clubs",
    })
  }
}

