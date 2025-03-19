import type { Request, Response } from "express"
import Club from "../models/Club"
import User from "../models/User"
import { sendInviteEmail } from "../utils/emailService"

// Get all clubs
export const getAllClubs = async (req: Request, res: Response) => {
  try {
    const clubs = await Club.find()
      .populate("federationId", "name abbreviation type")
      .populate("adminId", "firstName lastName email")

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
export const getClubById = async (req: Request, res: Response) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate("federationId", "name abbreviation type")
      .populate("adminId", "firstName lastName email")

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

// Create a new club
export const createClub = async (req: Request, res: Response) => {
  try {
    const {
      name,
      abbreviation,
      federationId,
      adminEmail,
      contactName,
      contactEmail,
      contactPhone,
      website,
      address,
      city,
      country,
      sendInvite,
    } = req.body

    // Check if club with same name or abbreviation already exists
    const existingClub = await Club.findOne({
      $or: [{ name }, { abbreviation }],
    })

    if (existingClub) {
      return res.status(400).json({
        success: false,
        error: "Club with this name or abbreviation already exists",
      })
    }

    // Check if admin user already exists
    let adminId
    const existingUser = await User.findOne({ email: adminEmail })

    if (existingUser) {
      adminId = existingUser._id

      // Update user role if needed
      if (existingUser.role !== "clubAdmin") {
        await User.findByIdAndUpdate(existingUser._id, { role: "clubAdmin" })
      }
    } else if (sendInvite) {
      // Create a new user with club admin role
      const newUser = new User({
        email: adminEmail,
        password: Math.random().toString(36).substring(2, 15), // Generate random password
        firstName: contactName ? contactName.split(" ")[0] : "Admin",
        lastName: contactName ? contactName.split(" ").slice(1).join(" ") : "User",
        role: "clubAdmin",
      })

      await newUser.save()
      adminId = newUser._id

      // Send invite email
      const inviteCode = Math.random().toString(36).substring(2, 15)
      await sendInviteEmail(adminEmail, newUser.firstName, newUser.lastName, inviteCode, "clubAdmin")
    }

    // Create the club
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

    // Update user with clubId
    if (adminId) {
      await User.findByIdAndUpdate(adminId, { clubId: club._id })
    }

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

// Update a club
export const updateClub = async (req: Request, res: Response) => {
  try {
    const {
      name,
      abbreviation,
      federationId,
      adminEmail,
      contactName,
      contactEmail,
      contactPhone,
      website,
      address,
      city,
      country,
    } = req.body

    const club = await Club.findById(req.params.id)

    if (!club) {
      return res.status(404).json({
        success: false,
        error: "Club not found",
      })
    }

    // Check if new admin email is provided
    if (adminEmail && (!club.adminId || adminEmail !== club.contactEmail)) {
      // Check if admin user already exists
      const existingUser = await User.findOne({ email: adminEmail })

      if (existingUser) {
        // Update club with new admin
        club.adminId = existingUser._id

        // Update user role if needed
        if (existingUser.role !== "clubAdmin") {
          await User.findByIdAndUpdate(existingUser._id, { role: "clubAdmin" })
        }

        // Update user with clubId
        await User.findByIdAndUpdate(existingUser._id, { clubId: club._id })
      } else {
        // Create a new user with club admin role
        const newUser = new User({
          email: adminEmail,
          password: Math.random().toString(36).substring(2, 15), // Generate random password
          firstName: contactName ? contactName.split(" ")[0] : "Admin",
          lastName: contactName ? contactName.split(" ").slice(1).join(" ") : "User",
          role: "clubAdmin",
          clubId: club._id,
        })

        await newUser.save()
        club.adminId = newUser._id

        // Send invite email
        const inviteCode = Math.random().toString(36).substring(2, 15)
        await sendInviteEmail(adminEmail, newUser.firstName, newUser.lastName, inviteCode, "clubAdmin")
      }
    }

    // Update club fields
    club.name = name || club.name
    club.abbreviation = abbreviation || club.abbreviation
    club.federationId = federationId || club.federationId
    club.contactName = contactName || club.contactName
    club.contactEmail = contactEmail || club.contactEmail
    club.contactPhone = contactPhone || club.contactPhone
    club.website = website || club.website
    club.address = address || club.address
    club.city = city || club.city
    club.country = country || club.country

    await club.save()

    res.status(200).json({
      success: true,
      data: club,
    })
  } catch (error) {
    console.error("Update club error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while updating club",
    })
  }
}

// Delete a club
export const deleteClub = async (req: Request, res: Response) => {
  try {
    const club = await Club.findById(req.params.id)

    if (!club) {
      return res.status(404).json({
        success: false,
        error: "Club not found",
      })
    }

    // Remove clubId from admin user
    if (club.adminId) {
      await User.findByIdAndUpdate(club.adminId, { $unset: { clubId: 1 } })
    }

    // Delete the club
    await Club.findByIdAndDelete(req.params.id)

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
export const getClubsByFederation = async (req: Request, res: Response) => {
  try {
    const { federationId } = req.params

    const clubs = await Club.find({ federationId })
      .populate("federationId", "name abbreviation type")
      .populate("adminId", "firstName lastName email")

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

