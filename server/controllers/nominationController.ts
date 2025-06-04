import type { Response } from "express";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "./authController";
import Nomination, { WeightCategory, INomination } from "../models/Nomination";
import Athlete from "../models/Athlete";
import Competition, { AgeCategory } from "../models/Competition";
import { isEligibleForAgeCategory } from "../utils/athleteService";
import Group from "../models/Group";

interface CreateNominationRequestBody {
  athleteId: mongoose.Types.ObjectId;
  competitionId: mongoose.Types.ObjectId;
  weightCategory: WeightCategory;
  ageCategory: AgeCategory;
}

interface BatchCreateNominationsRequestBody {
  nominations: CreateNominationRequestBody[];
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  nomination?: CreateNominationRequestBody;
}

interface BatchUpdateNominationsRequest {
  nominations: Array<{
    nominationId: string;
    updates: {
      flightNumber?: number;
      groupNumber?: number;
      groupName?: string;
      groupStartTime?: Date;
      groupStatus?: "pending" | "active" | "completed";
    };
  }>;
}

// Helper function to validate a single nomination
async function validateNomination(
  nomination: CreateNominationRequestBody
): Promise<ValidationResult> {
  const { athleteId, competitionId, ageCategory } = nomination;

  const athlete = await Athlete.findById(athleteId);
  const competition = await Competition.findById(competitionId);

  if (!athlete) {
    return { valid: false, error: `Athlete not found for ID: ${athleteId}` };
  }

  if (!competition) {
    return { valid: false, error: `Competition not found for ID: ${competitionId}` };
  }

  if (!competition.ageCategories.includes(ageCategory)) {
    return {
      valid: false,
      error: `Competition does not support age category for athlete: ${athleteId}`,
    };
  }

  if (!isEligibleForAgeCategory(athlete?.dateOfBirth, ageCategory)) {
    return {
      valid: false,
      error: `Athlete ${athleteId} is not eligible for age category`,
    };
  }

  return { valid: true, nomination };
}

// Helper function to create a nomination
async function createNominationDocument(
  nomination: CreateNominationRequestBody,
  nominatedBy: string
): Promise<INomination> {
  const newNomination = new Nomination({
    ...nomination,
    nominatedBy,
  });

  return await newNomination.save();
}

// Helper function to validate user authentication
function validateUserAuthentication(userId?: string): { valid: boolean; error?: string } {
  if (!userId) {
    return {
      valid: false,
      error: "User must be authenticated to create nominations",
    };
  }
  return { valid: true };
}

export const getNominationsByCompetitionId = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response
) => {
  try {
    const nominations = await Nomination.find({
      competitionId: req.params.id,
    }).populate("athleteId");

    if (!nominations) {
      return res.status(404).json({
        success: false,
        error: "No nominations found for this competition",
      });
    }

    res.status(200).json({
      success: true,
      data: nominations,
    });
  } catch (error) {
    console.error("Get member by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching member",
    });
  }
};

export const getNominationsByCompetitionIdAndWeightCategories = async (
  req: AuthenticatedRequest<{ id: string }, { weightCategories?: string }>,
  res: Response
) => {
  try {
    const weightCategories = req.query.weightCategories as string | undefined;
    const weightCategoryArray = weightCategories?.split(',') || [];

    const query: any = {
      competitionId: req.params.id,
    };

    if (weightCategoryArray.length > 0) {
      query.weightCategory = { $in: weightCategoryArray };
    }

    const nominations = await Nomination.find(query)
      .populate("athleteId")
      .sort({ weightCategory: 1 });

    if (!nominations) {
      return res.status(404).json({
        success: false,
        error: "No nominations found for this competition",
      });
    }

    res.status(200).json({
      success: true,
      data: nominations,
    });
  } catch (error) {
    console.error("Get nominations by weight categories error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching nominations",
    });
  }
};

export const getNominationsByCompetitionIdAndFlight = async (
  req: AuthenticatedRequest<{ id: string }, { flightNumber?: string }>,
  res: Response
) => {
  try {
    const flightNumberParam = req.query.flightNumber;
    const flightNumber = typeof flightNumberParam === 'string' 
      ? parseInt(flightNumberParam, 10) 
      : undefined;
    
    const query: any = {
      competitionId: req.params.id,
    };

    if (flightNumber && !isNaN(flightNumber)) {
      query.flightNumber = flightNumber;
    }

    const nominations = await Nomination.find(query)
      .populate("athleteId")
      .sort({ weightCategory: 1 });

    if (!nominations) {
      return res.status(404).json({
        success: false,
        error: "No nominations found for this competition",
      });
    }

    res.status(200).json({
      success: true,
      data: nominations,
    });
  } catch (error) {
    console.error("Get nominations by flight error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching nominations",
    });
  }
};

export const getNominationsByFlight = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response
) => {
  try {
    const { id: flightId } = req.params;

    // First find all groups in this flight
    const groups = await Group.find({ flightId });
    const groupIds = groups.map(g => g._id);

    // Then find nominations for these groups
    const nominations = await Nomination.find({ groupId: { $in: groupIds } })
      .populate("athleteId", "firstName lastName")
      .populate("groupId")
      .sort({ "athleteId.lastName": 1 });

    if (!nominations || nominations.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No nominations found for this flight",
      });
    }

    res.status(200).json({
      success: true,
      data: nominations,
    });
  } catch (error) {
    console.error("Error fetching nominations by flight:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching nominations",
    });
  }
};

// --------------------------------------------------------------------------------------------------------------
// CREATE REQUESTS
// --------------------------------------------------------------------------------------------------------------

export const createNomination = async (
  req: AuthenticatedRequest<{}, {}, CreateNominationRequestBody>,
  res: Response
) => {
  try {
    const { athleteId, competitionId, weightCategory, ageCategory } = req.body;
    const nominatedBy = req.user?.id;

    const authValidation = validateUserAuthentication(nominatedBy);
    if (!authValidation.valid) {
      return res.status(401).json({
        success: false,
        error: authValidation.error,
      });
    }

    const validationResult = await validateNomination({
      athleteId,
      competitionId,
      weightCategory,
      ageCategory,
    });

    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        error: validationResult.error,
      });
    }

    const nomination = await createNominationDocument(
      { athleteId, competitionId, weightCategory, ageCategory },
      nominatedBy!
    );

    res.status(201).json({
      success: true,
      data: nomination,
    });
  } catch (error) {
    console.error("Create nomination error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while creating nomination",
    });
  }
};

export const batchCreateNominations = async (
  req: AuthenticatedRequest<{}, {}, BatchCreateNominationsRequestBody>,
  res: Response
) => {
  try {
    const { nominations } = req.body;
    const nominatedBy = req.user?.id;

    const authValidation = validateUserAuthentication(nominatedBy);
    if (!authValidation.valid) {
      return res.status(401).json({
        success: false,
        error: authValidation.error,
      });
    }

    if (!Array.isArray(nominations) || nominations.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Request must include a non-empty array of nominations",
      });
    }

    // Validate all nominations first
    const validationResults = await Promise.all(
      nominations.map(validateNomination)
    );

    // Check if any nominations failed validation
    const invalidNominations = validationResults.filter((result) => !result.valid);
    if (invalidNominations.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Some nominations failed validation",
        invalidNominations: invalidNominations.map((result) => result.error),
      });
    }

    // Create all valid nominations
    const validNominations = validationResults
      .filter((result): result is { valid: true; nomination: CreateNominationRequestBody } => 
        result.valid
      )
      .map((result) => result.nomination);

    const createdNominations = await Nomination.insertMany(
      validNominations.map((nomination) => ({
        ...nomination,
        nominatedBy,
      }))
    );

    res.status(201).json({
      success: true,
      data: createdNominations,
    });
  } catch (error) {
    console.error("Batch create nominations error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while creating nominations",
    });
  }
};

export const deleteNomination = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response
) => {
  try {
    const nominationId = req.params.id;
    const userId = req.user?.id;

    const authValidation = validateUserAuthentication(userId);
    if (!authValidation.valid) {
      return res.status(401).json({
        success: false,
        error: authValidation.error,
      });
    }

    // Find the nomination first to check if it exists
    const nomination = await Nomination.findById(nominationId);
    if (!nomination) {
      return res.status(404).json({
        success: false,
        error: "Nomination not found",
      });
    }

    // Delete the nomination
    await Nomination.findByIdAndDelete(nominationId);

    res.status(200).json({
      success: true,
      message: "Nomination deleted successfully",
    });
  } catch (error) {
    console.error("Delete nomination error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while deleting nomination",
    });
  }
};

export const batchUpdateNominations = async (
  req: AuthenticatedRequest<{}, {}, BatchUpdateNominationsRequest>,
  res: Response
) => {
  try {
    const { nominations } = req.body;
    const userId = req.user?.id;

    const authValidation = validateUserAuthentication(userId);
    if (!authValidation.valid) {
      return res.status(401).json({
        success: false,
        error: authValidation.error,
      });
    }

    if (!Array.isArray(nominations) || nominations.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Request must include a non-empty array of nominations",
      });
    }

    // Create an array of update operations
    const updateOperations = nominations.map(({ nominationId, updates }) => ({
      updateOne: {
        filter: { _id: nominationId },
        update: { $set: updates },
      },
    }));

    // Perform bulk write operation
    const result = await Nomination.bulkWrite(updateOperations);

    if (result.modifiedCount !== nominations.length) {
      return res.status(400).json({
        success: false,
        error: "Some nominations could not be updated",
        details: {
          requested: nominations.length,
          modified: result.modifiedCount,
        },
      });
    }

    // Fetch updated nominations
    const updatedNominations = await Nomination.find({
      _id: { $in: nominations.map(n => n.nominationId) },
    }).populate("athleteId");

    res.status(200).json({
      success: true,
      data: updatedNominations,
    });
  } catch (error) {
    console.error("Batch update nominations error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while updating nominations",
    });
  }
};
