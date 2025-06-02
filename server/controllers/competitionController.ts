import type { Response } from "express";
import Competition, { EquipmentType } from "../models/Competition";
import { AuthenticatedRequest } from "./authController";
import mongoose from "mongoose";
import Federation, { IFederation } from "../models/Federation";

interface CreateCompetitionRequestBody {
  name: string;
  startDate: Date;
  endDate: Date;
  location: string;
  address?: string;
  city: string;
  country: string;
  hostFederation: mongoose.Types.ObjectId;
  hostMember?: mongoose.Types.ObjectId;
  eligibleFederations: mongoose.Types.ObjectId[];
  equipmentType: EquipmentType;
  ageCategories: string[];
  description?: string;
  status: string;
  nominationDeadline: Date;
  officials?: mongoose.Types.ObjectId[];
}

interface UpdateCompetitionRequestBody
  extends Partial<CreateCompetitionRequestBody> {}

export const getCompetitionById = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response
) => {
  try {
    const competition = await Competition.findById(req.params.id)
      .populate("hostFederation")
      .populate("eligibleFederations")
      .populate("hostMember")
      .populate("officials");
    if (!competition) {
      return res.status(404).json({
        success: false,
        error: "Competition not found",
      });
    }

    res.status(200).json({
      success: true,
      data: competition,
    });
  } catch (error) {
    console.error("Get competition by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching competition",
    });
  }
};

export const getCompetitionsByHostFederation = async (
  req: AuthenticatedRequest<{ federationId: string }>,
  res: Response
) => {
  try {
    const competitions = await Competition.find({
      hostFederation: req.params.federationId,
    })
      .populate("hostFederation")
      .populate("eligibleFederations")
      .populate("hostMember")
      .populate("officials");

    if (!competitions) {
      return res.status(404).json({
        success: false,
        error: "No competitions found for this federation",
      });
    }

    res.status(200).json({
      success: true,
      data: competitions,
    });
  } catch (error) {
    console.error("Get competitions by host federation ID error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching competitions",
    });
  }
};
export const getInternationalCompetitions = async (
  req: AuthenticatedRequest<{ federationId: string }>,
  res: Response
) => {
  try {
    const { federationId } = req.params;
    const federation = await Federation.findById(federationId);

    if (!federation) {
      return res.status(404).json({
        success: false,
        error: "Federation not found",
      });
    }

    // Get direct parents and check their types
    const directParents = await Federation.find({
      _id: { $in: federation.parents || [] },
    });

    // Check if federation has a direct REGIONAL or INTERNATIONAL parent
    const hasInternationalParent = directParents.some(
      (parent) => parent.type === "REGIONAL" || parent.type === "INTERNATIONAL"
    );

    if (!hasInternationalParent && !(federation.type === "INTERNATIONAL")) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message:
          "Federation does not have a direct REGIONAL or INTERNATIONAL parent",
      });
    }

    const federationIds = federation.type !== "NATIONAL" ? [federationId] : [];
    const visited = new Set<string>();
    let stack = [federation];

    // Collect all parent federations up to INTERNATIONAL level
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || visited.has(current._id.toString())) continue;

      visited.add(current._id.toString());

      // If we find an INTERNATIONAL federation, add all its competitions
      if (current.type === "INTERNATIONAL") {
        const internationalFederations = await Federation.find({
          type: { $in: ["INTERNATIONAL", "REGIONAL"] },
        });

        for (const f of internationalFederations) {
          federationIds.push(f._id.toString());
        }
        break;
      }

      // Add parents to the stack
      if (current.parents && current.parents.length > 0) {
        const parents = await Federation.find({
          _id: { $in: current.parents },
        });
        stack.push(...parents);
      }
    }

    const competitions = await Competition.find({
      hostFederation: { $in: federationIds },
    })
      .populate("hostFederation")
      .populate("eligibleFederations")
      .populate("hostMember")
      .populate("officials");

    res.status(200).json({
      success: true,
      count: competitions.length,
      data: competitions,
    });
  } catch (error) {
    console.error("Get competitions from hierarchy upwards error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching competitions from hierarchy",
    });
  }
};

export const getNationalCompetitions = async (
  req: AuthenticatedRequest<{ federationId: string }>,
  res: Response
) => {
  try {
    const { federationId } = req.params;
    const federation = await Federation.findById(federationId);

    if (!federation) {
      return res.status(404).json({
        success: false,
        error: "Federation not found",
      });
    }

    const federationIds: string[] = [];
    const visited = new Set<string>();
    let stack = [federation];

    // First, collect all parent federations if we're a STATE or LOCAL federation
    if (federation.type === "STATE" || federation.type === "LOCAL") {
      while (stack.length > 0) {
        const current = stack.pop();
        if (!current || visited.has(current._id.toString())) continue;

        visited.add(current._id.toString());
        federationIds.push(current._id.toString());

        // If we find a NATIONAL federation, we can stop going up
        if (current.type === "NATIONAL") {
          break;
        }

        // Add parents to the stack
        if (current.parents && current.parents.length > 0) {
          const parents = await Federation.find({
            _id: { $in: current.parents },
          });
          stack.push(...parents);
        }
      }
    } else if (federation.type === "NATIONAL") {
      // If we're a NATIONAL federation, just add ourselves
      federationIds.push(federationId);
    }

    // Then, collect all child federations
    const findChildFederations = async (parentId: string) => {
      const children = await Federation.find({ parents: parentId });

      for (const child of children) {
        // Only add STATE and LOCAL federations
        if (child.type === "STATE" || child.type === "LOCAL") {
          federationIds.push(child._id.toString());
        }
        await findChildFederations(child._id.toString());
      }
    };

    // Start finding children from each collected federation ID
    for (const fid of federationIds) {
      await findChildFederations(fid);
    }

    const competitions = await Competition.find({
      hostFederation: { $in: federationIds },
    })
      .populate("hostFederation")
      .populate("eligibleFederations")
      .populate("hostMember")
      .populate("officials");

    res.status(200).json({
      success: true,
      count: competitions.length,
      data: competitions,
    });
  } catch (error) {
    console.error("Get competitions from hierarchy downwards error:", error);
    res.status(500).json({
      success: false,
      error:
        "Server error while fetching competitions from hierarchy downwards",
    });
  }
};
// --------------------------------------------------------------------------------------------------------------
// CREATE REQUESTS
// --------------------------------------------------------------------------------------------------------------

export const createCompetition = async (
  req: AuthenticatedRequest<{}, {}, CreateCompetitionRequestBody>,
  res: Response
) => {
  try {
    const competition = new Competition(req.body);
    await competition.save();

    res.status(201).json({
      success: true,
      data: competition,
    });
  } catch (error) {
    console.error("Create competition error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while creating competition",
    });
  }
};

// --------------------------------------------------------------------------------------------------------------
// UPDATE REQUESTS
// --------------------------------------------------------------------------------------------------------------

export const updateCompetition = async (
  req: AuthenticatedRequest<{ id: string }, {}, UpdateCompetitionRequestBody>,
  res: Response
) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({
        success: false,
        error: "Competition not found",
      });
    }
    const updatedCompetition = await Competition.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("hostFederation")
      .populate("eligibleFederations")
      .populate("hostMember")
      .populate("officials");

    res.status(200).json({
      success: true,
      data: updatedCompetition,
    });
  } catch (error) {
    console.error("Update competition error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while updating competition",
    });
  }
};

// --------------------------------------------------------------------------------------------------------------
// DELETE REQUESTS
// --------------------------------------------------------------------------------------------------------------

export const deleteCompetition = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response
) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({
        success: false,
        error: "Competition not found",
      });
    }

    await competition.deleteOne();

    res.status(200).json({
      success: true,
      message: "Competition deleted successfully",
    });
  } catch (error) {
    console.error("Delete competition error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while deleting competition",
    });
  }
};
