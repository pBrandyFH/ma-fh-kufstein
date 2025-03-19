import type { Request, Response } from "express"
import Federation from "../models/Federation"
import User from "../models/User"
import { sendInviteEmail } from "../utils/emailService"

// Get all federations
export const getAllFederations = async (req: Request, res: Response) => {
  try {
    const federations = await Federation.find().populate("parentFederation", "name abbreviation type")

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
export const getFederationById = async (req: Request, res: Response) => {
  try {
    const federation = await Federation.findById(req.params.id)
      .populate("parentFederation", "name abbreviation type")
      .populate("adminId", "firstName lastName email")

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

// Create a new federation
export const createFederation = async (req: Request, res: Response) => {
  try {
    const {
      name,
      abbreviation,
      type,
      parentFederation,
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

    // Check if federation with same name or abbreviation already exists
    const existingFederation = await Federation.findOne({
      $or: [{ name }, { abbreviation }],
    })

    if (existingFederation) {
      return res.status(400).json({
        success: false,
        error: "Federation with this name or abbreviation already exists",
      })
    }

    // Determine admin role based on federation type
    let adminRole
    switch (type) {
      case "international":
        adminRole = "internationalAdmin"
        break
      case "continental":
        adminRole = "continentalAdmin"
        break
      case "national":
        adminRole = "stateAdmin"
        break
      case "federalState":
        adminRole = "federalStateAdmin"
        break
      default:
        adminRole = "federalStateAdmin"
    }

    // Check if admin user already exists
    let adminId
    const existingUser = await User.findOne({ email: adminEmail })

    if (existingUser) {
      adminId = existingUser._id

      // Update user role if needed
      if (existingUser.role !== adminRole) {
        await User.findByIdAndUpdate(existingUser._id, { role: adminRole })
      }
    } else if (sendInvite) {
      // Create a new user with admin role
      const newUser = new User({
        email: adminEmail,
        password: Math.random().toString(36).substring(2, 15), // Generate random password
        firstName: contactName ? contactName.split(" ")[0] : "Admin",
        lastName: contactName ? contactName.split(" ").slice(1).join(" ") : "User",
        role: adminRole,
      })

      await newUser.save()
      adminId = newUser._id

      // Send invite email
      const inviteCode = Math.random().toString(36).substring(2, 15)
      await sendInviteEmail(adminEmail, newUser.firstName, newUser.lastName, inviteCode, adminRole)
    }

    // Create the federation
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

    // Update user with federationId
    if (adminId) {
      await User.findByIdAndUpdate(adminId, { federationId: federation._id })
    }

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

// Update a federation
export const updateFederation = async (req: Request, res: Response) => {
  try {
    const {
      name,
      abbreviation,
      type,
      parentFederation,
      adminEmail,
      contactName,
      contactEmail,
      contactPhone,
      website,
      address,
      city,
      country,
    } = req.body

    const federation = await Federation.findById(req.params.id)

    if (!federation) {
      return res.status(404).json({
        success: false,
        error: "Federation not found",
      })
    }

    // Check if new admin email is provided
    if (adminEmail && (!federation.adminId || adminEmail !== federation.contactEmail)) {
      // Determine admin role based on federation type
      let adminRole
      switch (type || federation.type) {
        case "international":
          adminRole = "internationalAdmin"
          break
        case "continental":
          adminRole = "continentalAdmin"
          break
        case "national":
          adminRole = "stateAdmin"
          break
        case "federalState":
          adminRole = "federalStateAdmin"
          break
        default:
          adminRole = "federalStateAdmin"
      }

      // Check if admin user already exists
      const existingUser = await User.findOne({ email: adminEmail })

      if (existingUser) {
        // Update federation with new admin
        federation.adminId = existingUser._id

        // Update user role if needed
        if (existingUser.role !== adminRole) {
          await User.findByIdAndUpdate(existingUser._id, { role: adminRole })
        }

        // Update user with federationId
        await User.findByIdAndUpdate(existingUser._id, { federationId: federation._id })
      } else {
        // Create a new user with admin role
        const newUser = new User({
          email: adminEmail,
          password: Math.random().toString(36).substring(2, 15), // Generate random password
          firstName: contactName ? contactName.split(" ")[0] : "Admin",
          lastName: contactName ? contactName.split(" ").slice(1).join(" ") : "User",
          role: adminRole,
          federationId: federation._id,
        })

        await newUser.save()
        federation.adminId = newUser._id

        // Send invite email
        const inviteCode = Math.random().toString(36).substring(2, 15)
        await sendInviteEmail(adminEmail, newUser.firstName, newUser.lastName, inviteCode, adminRole)
      }
    }

    // Update federation fields
    federation.name = name || federation.name
    federation.abbreviation = abbreviation || federation.abbreviation
    federation.type = type || federation.type
    federation.parentFederation = parentFederation || federation.parentFederation
    federation.contactName = contactName || federation.contactName
    federation.contactEmail = contactEmail || federation.contactEmail
    federation.contactPhone = contactPhone || federation.contactPhone
    federation.website = website || federation.website
    federation.address = address || federation.address
    federation.city = city || federation.city
    federation.country = country || federation.country

    await federation.save()

    res.status(200).json({
      success: true,
      data: federation,
    })
  } catch (error) {
    console.error("Update federation error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while updating federation",
    })
  }
}

// Delete a federation
export const deleteFederation = async (req: Request, res: Response) => {
  try {
    const federation = await Federation.findById(req.params.id)

    if (!federation) {
      return res.status(404).json({
        success: false,
        error: "Federation not found",
      })
    }

    // Check if federation has child federations
    const childFederations = await Federation.find({ parentFederation: federation._id })

    if (childFederations.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete federation with child federations",
      })
    }

    // Remove federationId from admin user
    if (federation.adminId) {
      await User.findByIdAndUpdate(federation.adminId, { $unset: { federationId: 1 } })
    }

    // Delete the federation
    await Federation.findByIdAndDelete(req.params.id)

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
export const getFederationsByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params

    const federations = await Federation.find({ type }).populate("parentFederation", "name abbreviation type")

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
export const getFederationsByParent = async (req: Request, res: Response) => {
  try {
    const { parentId } = req.params

    const federations = await Federation.find({ parentFederation: parentId }).populate(
      "parentFederation",
      "name abbreviation type",
    )

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
export const getChildFederations = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const federations = await Federation.find({ parentFederation: id }).populate(
      "parentFederation",
      "name abbreviation type",
    )

    res.status(200).json({
      success: true,
      data: federations,
    })
  } catch (error) {
    console.error("Get child federations error:", error)
    res.status(500).json({
      success: false,
      error: "Server error while fetching federations",
    })
  }
}

