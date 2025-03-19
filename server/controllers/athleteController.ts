import type { Request, Response } from "express"
import Athlete from "../models/Athlete"
import User from "../models/User"
import { sendInviteEmail } from "../utils/emailService"

// Get all athletes
export const getAllAthletes = async (req: Request, res: Response) => {
  try {
    const athletes = await Athlete.find().populate("clubId", "name").populate("federationId", "name")

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
export const getAthleteById = async (req: Request, res: Response) => {
  try {
    const athlete = await Athlete.findById(req.params.id)
      .populate("clubId", "name")
      .populate("federationId", "name")
      .populate("coachIds", "firstName lastName")

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

// Create a new athlete
export const createAthlete = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, dateOfBirth, gender, weightCategory, clubId, federationId, sendInvite } =
      req.body

    // Check if user with email already exists
    const existingUser = await User.findOne({ email })
    let userId

    if (existingUser) {
      // If user exists, check if they're already an athlete
      const existingAthlete = await Athlete.findOne({ userId: existingUser._id })
      if (existingAthlete) {
        return res.status(400).json({
          success: false,
          error: "User is already registered as an athlete",
        })
      }
      userId = existingUser._id
    } else {
      // Create a new user with athlete role
      const newUser = new User({
        email,
        password: Math.random().toString(36).substring(2, 15), // Generate random password
        firstName,
        lastName,
        role: "athlete",
      })

      await newUser.save()
      userId = newUser._id

      // Send invite email if requested
      if (sendInvite) {
        // Generate a unique invite code
        const inviteCode = Math.random().toString(36).substring(2, 15)

        // TODO: Store the invite code in the database

        await sendInviteEmail(email, firstName, lastName, inviteCode, "athlete")
      }
    }

    // Create the athlete
    const athlete = new Athlete({
      userId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      weightCategory,
      clubId,
      federationId,
    })

    await athlete.save()

    // Update user with athleteId
    await User.findByIdAndUpdate(userId, { athleteId: athlete._id })

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

// Update an athlete
export const updateAthlete = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, dateOfBirth, gender, weightCategory, clubId, federationId, isNationalTeam } = req.body

    const athlete = await Athlete.findByIdAndUpdate(
      req.params.id,
      {
        firstName,
        lastName,
        dateOfBirth,
        gender,
        weightCategory,
        clubId,
        federationId,
        isNationalTeam,
      },
      { new: true },
    )

    if (!athlete) {
      return res.status(404).json({
        success: false,
        error: "Athlete not found",
      })
    }

    // Update user information as well
    await User.findByIdAndUpdate(athlete.userId, {
      firstName,
      lastName,
    })

    res.status(200).json({
      success: true,
      data: athlete,
    })
  } catch (error) {
    console.error("Update athlete error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while updating athlete",
    })
  }
}

// Delete an athlete
export const deleteAthlete = async (req: Request, res: Response) => {
  try {
    const athlete = await Athlete.findById(req.params.id)

    if (!athlete) {
      return res.status(404).json({
        success: false,
        error: "Athlete not found",
      })
    }

    // Remove athleteId from user
    await User.findByIdAndUpdate(athlete.userId, { $unset: { athleteId: 1 } })

    // Delete the athlete
    await Athlete.findByIdAndDelete(req.params.id)

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
export const getAthletesByFederation = async (req: Request, res: Response) => {
  try {
    const { federationId } = req.params
    const { nationalTeam } = req.query

    const query: any = { federationId }

    // If nationalTeam query param is provided
    if (nationalTeam === "true") {
      query.isNationalTeam = true
    }

    const athletes = await Athlete.find(query).populate("clubId", "name").populate("federationId", "name")

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
export const getAthletesByClub = async (req: Request, res: Response) => {
  try {
    const { clubId } = req.params

    const athletes = await Athlete.find({ clubId }).populate("clubId", "name").populate("federationId", "name")

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
export const getAthletesByCoach = async (req: Request, res: Response) => {
  try {
    const { coachId } = req.params

    const athletes = await Athlete.find({ coachIds: coachId })
      .populate("clubId", "name")
      .populate("federationId", "name")

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

