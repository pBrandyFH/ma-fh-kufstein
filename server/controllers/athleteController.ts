import type { Request, Response } from "express"
import mongoose from "mongoose"
import Athlete from "../models/Athlete"
import User from "../models/User"
import { sendInviteEmail } from "../utils/emailService"
import { AuthenticatedRequest } from "./authController"

interface CreateAthleteRequestBody {
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: "male" | "female"
  weightCategory: string
  clubId: mongoose.Types.ObjectId
  federationId: mongoose.Types.ObjectId
  coachIds?: mongoose.Types.ObjectId[]
  isNationalTeam?: boolean
}

interface UpdateAthleteRequestBody extends Partial<CreateAthleteRequestBody> {}

// Get all athletes
export const getAllAthletes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const athletes = await Athlete.find()
      .populate<{ clubId: { name: string } }>("clubId", "name")
      .populate<{ federationId: { name: string } }>("federationId", "name")

    res.status(200).json({
      success: true,
      data: athletes,
    })
  } catch (error) {
    console.error("Get all athletes error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while fetching athletes",
    })
  }
}

// Get athlete by ID
export const getAthleteById = async (req: AuthenticatedRequest<{ id: string }>, res: Response) => {
  try {
    const athlete = await Athlete.findById(req.params.id)
      .populate<{ clubId: { name: string } }>("clubId", "name")
      .populate<{ federationId: { name: string } }>("federationId", "name")
      .populate<{ coachIds: { firstName: string; lastName: string }[] }>("coachIds", "firstName lastName")

    if (!athlete) {
      return res.status(404).json({
        success: false,
        error: "Athlete not found",
      })
    }

    res.status(200).json({
      success: true,
      data: athlete,
    })
  } catch (error) {
    console.error("Get athlete by ID error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while fetching athlete",
    })
  }
}

// Create new athlete
export const createAthlete = async (
  req: AuthenticatedRequest<{}, {}, CreateAthleteRequestBody>,
  res: Response
) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      weightCategory,
      clubId,
      federationId,
      coachIds,
      isNationalTeam,
    } = req.body

    const athlete = new Athlete({
      firstName,
      lastName,
      dateOfBirth,
      gender,
      weightCategory,
      clubId,
      federationId,
      coachIds,
      isNationalTeam,
    })

    await athlete.save()

    res.status(201).json({
      success: true,
      data: athlete,
    })
  } catch (error) {
    console.error("Create athlete error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while creating athlete",
    })
  }
}

// Update athlete
export const updateAthlete = async (
  req: AuthenticatedRequest<{ id: string }, {}, UpdateAthleteRequestBody>,
  res: Response
) => {
  try {
    const athlete = await Athlete.findById(req.params.id)

    if (!athlete) {
      return res.status(404).json({
        success: false,
        error: "Athlete not found",
      })
    }

    const updatedAthlete = await Athlete.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    res.status(200).json({
      success: true,
      data: updatedAthlete,
    })
  } catch (error) {
    console.error("Update athlete error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while updating athlete",
    })
  }
}

// Delete athlete
export const deleteAthlete = async (req: AuthenticatedRequest<{ id: string }>, res: Response) => {
  try {
    const athlete = await Athlete.findById(req.params.id)

    if (!athlete) {
      return res.status(404).json({
        success: false,
        error: "Athlete not found",
      })
    }

    await athlete.deleteOne()

    res.status(200).json({
      success: true,
      message: "Athlete deleted successfully",
    })
  } catch (error) {
    console.error("Delete athlete error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while deleting athlete",
    })
  }
}

// Get athletes by federation
export const getAthletesByFederation = async (
  req: AuthenticatedRequest<{ federationId: string }>,
  res: Response
) => {
  try {
    const athletes = await Athlete.find({ federationId: req.params.federationId })
      .populate<{ clubId: { name: string } }>("clubId", "name")
      .populate<{ federationId: { name: string } }>("federationId", "name")

    res.status(200).json({
      success: true,
      data: athletes,
    })
  } catch (error) {
    console.error("Get athletes by federation error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while fetching athletes",
    })
  }
}

// Get athletes by club
export const getAthletesByClub = async (
  req: AuthenticatedRequest<{ clubId: string }>,
  res: Response
) => {
  try {
    const athletes = await Athlete.find({ clubId: req.params.clubId })
      .populate<{ clubId: { name: string } }>("clubId", "name")
      .populate<{ federationId: { name: string } }>("federationId", "name")

    res.status(200).json({
      success: true,
      data: athletes,
    })
  } catch (error) {
    console.error("Get athletes by club error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while fetching athletes",
    })
  }
}

// Get athletes by coach
export const getAthletesByCoach = async (
  req: AuthenticatedRequest<{ coachId: string }>,
  res: Response
) => {
  try {
    const athletes = await Athlete.find({ coachIds: req.params.coachId })
      .populate<{ clubId: { name: string } }>("clubId", "name")
      .populate<{ federationId: { name: string } }>("federationId", "name")

    res.status(200).json({
      success: true,
      data: athletes,
    })
  } catch (error) {
    console.error("Get athletes by coach error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while fetching athletes",
    })
  }
}

