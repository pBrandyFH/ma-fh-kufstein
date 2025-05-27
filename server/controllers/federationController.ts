import type { Request, Response } from "express";
import mongoose from "mongoose";
import Federation from "../models/Federation";
import { AuthenticatedRequest } from "./authController";
import { FederationLevel } from "../permissions/types";

interface CreateFederationRequestBody {
  name: string;
  abbreviation: string;
  type: FederationLevel;
  parents?: mongoose.Types.ObjectId[];
  adminId?: mongoose.Types.ObjectId;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
}

interface UpdateFederationRequestBody
  extends Partial<CreateFederationRequestBody> {}

// --------------------------------------------------------------------------------------------------------------
// READ REQUESTS
// --------------------------------------------------------------------------------------------------------------

export const getAllFederations = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const federations = await Federation.find()
      .populate("parents", "name abbreviation type")
      .populate("adminId", "firstName lastName email");

    res.status(200).json({ success: true, data: federations });
  } catch (error) {
    console.error("Get all federations error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching federations",
    });
  }
};

export const getFederationById = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response
) => {
  try {
    const federation = await Federation.findById(req.params.id)
      .populate("parents", "name abbreviation type")
      .populate("adminId", "firstName lastName email");

    if (!federation) {
      return res.status(404).json({
        success: false,
        error: "Federation not found",
      });
    }

    res.status(200).json({ success: true, data: federation });
  } catch (error) {
    console.error("Get federation by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching federation",
    });
  }
};

export const getFederationsByType = async (
  req: AuthenticatedRequest<{ type: FederationLevel }>,
  res: Response
) => {
  try {
    const federations = await Federation.find({
      type: req.params.type,
    }).populate("parents", "name abbreviation type");

    res.status(200).json({ success: true, data: federations });
  } catch (error) {
    console.error("Get federations by type error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching federations",
    });
  }
};

export const getFederationsByParent = async (
  req: AuthenticatedRequest<{ parentId: string }>,
  res: Response
) => {
  try {
    const federations = await Federation.find({
      parents: req.params.parentId,
    }).populate("parents", "name abbreviation type");

    res.status(200).json({ success: true, data: federations });
  } catch (error) {
    console.error("Get federations by parent error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching federations",
    });
  }
};

// Get child federations
export const getChildFederations = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response
) => {
  try {
    const childFederations = await Federation.find({
      parents: req.params.id,
    }).populate("parents");

    res.status(200).json({
      success: true,
      data: childFederations,
    });
  } catch (error) {
    console.error("Get child federations error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching child federations",
    });
  }
};

export const getFederationsByTypeFilter = async (
  req: AuthenticatedRequest<{}, {}, { types: string[] }>,
  res: Response
) => {
  try {
    const { types } = req.body;

    if (!Array.isArray(types)) {
      return res.status(400).json({
        success: false,
        error: "Types must be an array",
      });
    }

    const validTypes = [
      "INTERNATIONAL",
      "REGIONAL",
      "NATIONAL",
      "STATE",
      "LOCAL",
    ];
    const invalidTypes = types.filter((type) => !validTypes.includes(type));

    if (invalidTypes.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid federation types: ${invalidTypes.join(", ")}`,
      });
    }

    const federations = await Federation.find({ type: { $in: types } })
      .sort({ name: 1 })
      .populate("parents", "name abbreviation type");

    return res.json({ success: true, data: federations });
  } catch (error) {
    console.error("Error fetching federations by type filter:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch federations",
    });
  }
};

// --------------------------------------------------------------------------------------------------------------
// CREATE REQUESTS
// --------------------------------------------------------------------------------------------------------------

export const createFederation = async (
  req: AuthenticatedRequest<{}, {}, CreateFederationRequestBody>,
  res: Response
) => {
  try {
    const {
      name,
      abbreviation,
      type,
      parents,
      adminId,
      contactName,
      contactEmail,
      contactPhone,
      website,
      address,
      city,
      country,
    } = req.body;

    const federation = new Federation({
      name,
      abbreviation,
      type,
      parents,
      adminId,
      contactName,
      contactEmail,
      contactPhone,
      website,
      address,
      city,
      country,
    });

    await federation.save();

    const populatedFederation = await Federation.findById(
      federation._id
    ).populate("parents", "name abbreviation type");

    res.status(201).json({
      success: true,
      data: populatedFederation,
    });
  } catch (error) {
    console.error("Create federation error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while creating federation",
    });
  }
};

// --------------------------------------------------------------------------------------------------------------
// UPDATE REQUESTS
// --------------------------------------------------------------------------------------------------------------

export const updateFederation = async (
  req: AuthenticatedRequest<{ id: string }, {}, UpdateFederationRequestBody>,
  res: Response
) => {
  try {
    const federation = await Federation.findById(req.params.id);

    if (!federation) {
      return res.status(404).json({
        success: false,
        error: "Federation not found",
      });
    }

    const updatedFederation = await Federation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("parents", "name abbreviation type");

    res.status(200).json({ success: true, data: updatedFederation });
  } catch (error) {
    console.error("Update federation error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while updating federation",
    });
  }
};

// --------------------------------------------------------------------------------------------------------------
// DELETE REQUESTS
// --------------------------------------------------------------------------------------------------------------

export const deleteFederation = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response
) => {
  try {
    const federation = await Federation.findById(req.params.id);

    if (!federation) {
      return res.status(404).json({
        success: false,
        error: "Federation not found",
      });
    }

    const referencingFederations = await Federation.find({
      parents: federation._id,
    });

    if (referencingFederations.length > 0) {
      return res.status(400).json({
        success: false,
        error:
          "Cannot delete federation that is a parent of others. Remove references first.",
      });
    }

    await federation.deleteOne();

    res.status(200).json({
      success: true,
      message: "Federation deleted successfully",
    });
  } catch (error) {
    console.error("Delete federation error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while deleting federation",
    });
  }
};
