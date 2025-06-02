import type { Response } from "express";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "./authController";
import Nomination, { WeightCategory, INomination } from "../models/Nomination";
import Athlete from "../models/Athlete";
import Competition, { AgeCategory } from "../models/Competition";
import { isEligibleForAgeCategory } from "../utils/athleteService";

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
