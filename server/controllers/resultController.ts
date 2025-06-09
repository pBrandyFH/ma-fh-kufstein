import { Response } from "express";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "./authController";
import Result from "../models/Result";
import Nomination from "../models/Nomination";

// Helper function to get or create a result document
async function getOrCreateResult(
  athleteId: string,
  competitionId: string,
  nominationId: string,
  ageCategory?: string,
  weightCategory?: string
) {
  let result = await Result.findOne({ 
    athleteId: new mongoose.Types.ObjectId(athleteId), 
    competitionId: new mongoose.Types.ObjectId(competitionId) 
  });
  
  if (!result) {
    if (!ageCategory || !weightCategory) {
      throw new Error(
        "ageCategory and weightCategory are required when creating a new result"
      );
    }
    result = await Result.create({
      athleteId: new mongoose.Types.ObjectId(athleteId),
      competitionId: new mongoose.Types.ObjectId(competitionId),
      nominationId: new mongoose.Types.ObjectId(nominationId),
      ageCategory,
      weightCategory,
      weighIn: {
        bodyweight: null,
        lotNumber: null,
        timestamp: null,
      },
      attempts: {
        squat: Array(3).fill({ weight: null, status: null, timestamp: null }),
        bench: Array(3).fill({ weight: null, status: null, timestamp: null }),
        deadlift: Array(3).fill({
          weight: null,
          status: null,
          timestamp: null,
        }),
      },
      best: {
        squat: null,
        bench: null,
        deadlift: null,
      },
      total: null,
      wilks: null,
      ipfPoints: null,
      place: null,
    });
  }
  return result;
}

// Save weigh-in data
export const saveWeighIn = async (
  req: AuthenticatedRequest<
    {},
    {},
    {
      athleteId: string;
      nominationId: string;
      competitionId: string;
      bodyweight: number;
      lotNumber: number;
      startWeights: {
        squat: number;
        bench: number;
        deadlift: number;
      };
      flightId: string;
      groupId: string;
      ageCategory: string;
      weightCategory: string;
    }
  >,
  res: Response
) => {
  try {
    const {
      athleteId,
      nominationId,
      competitionId,
      bodyweight,
      lotNumber,
      startWeights,
      flightId,
      groupId,
      ageCategory,
      weightCategory,
    } = req.body;

    const result = await getOrCreateResult(
      athleteId,
      competitionId,
      nominationId,
      ageCategory,
      weightCategory
    );

    // Update weigh-in data and categories
    result.weighIn = {
      bodyweight,
      lotNumber,
      timestamp: new Date(),
    };
    result.nominationId = new mongoose.Types.ObjectId(nominationId);
    result.flightId = new mongoose.Types.ObjectId(flightId);
    result.groupId = new mongoose.Types.ObjectId(groupId);
    result.ageCategory = ageCategory;
    result.weightCategory = weightCategory;

    // Set starting weights as first attempts
    if (startWeights) {
      result.attempts.squat[0] = {
        weight: startWeights.squat,
        status: "pending",
        timestamp: new Date(),
      };
      result.attempts.bench[0] = {
        weight: startWeights.bench,
        status: "pending",
        timestamp: new Date(),
      };
      result.attempts.deadlift[0] = {
        weight: startWeights.deadlift,
        status: "pending",
        timestamp: new Date(),
      };
    }

    await result.save();

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error saving weigh-in:", error);
    res.status(500).json({
      success: false,
      error: "Server error while saving weigh-in data",
    });
  }
};

// Save attempt
export const saveAttempt = async (
  req: AuthenticatedRequest<
    {},
    {},
    {
      athleteId: string;
      competitionId: string;
      liftType: "squat" | "bench" | "deadlift";
      attemptNumber: number;
      weight: number;
      status: "good" | "noGood" | "pending";
      flightId: string;
      groupId: string;
    }
  >,
  res: Response
) => {
  try {
    const {
      athleteId,
      competitionId,
      liftType,
      attemptNumber,
      weight,
      status,
      flightId,
      groupId,
    } = req.body;

    // Find the nomination to get the nominationId
    const nomination = await Nomination.findOne({
      athleteId: new mongoose.Types.ObjectId(athleteId),
      competitionId: new mongoose.Types.ObjectId(competitionId),
    });

    if (!nomination) {
      return res.status(404).json({
        success: false,
        error: "Nomination not found for athlete",
      });
    }

    const result = await getOrCreateResult(
      athleteId,
      competitionId,
      nomination._id.toString(),
      nomination.ageCategory,
      nomination.weightCategory
    );

    // Update attempt data
    const attemptIndex = attemptNumber - 1; // Convert to 0-based index
    const attempt = result.attempts[liftType][attemptIndex];

    // Update the attempt
    attempt.weight = weight;
    attempt.status = status;
    attempt.timestamp = new Date();

    // Only update best lift if the attempt is good and better than current best
    if (status === "good") {
      const currentBest = result.best[liftType] || 0;
      if (weight > currentBest) {
        result.best[liftType] = weight;
        // Recalculate totals
        result.calculateTotals();
      }
    }

    await result.save();

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error saving attempt:", error);
    res.status(500).json({
      success: false,
      error: "Server error while saving attempt data",
    });
  }
};

// Get results by competition and flight
export const getResultsByCompetitionAndFlight = async (
  req: AuthenticatedRequest<{
    competitionId: string;
    flightNumber: string;
    groupNumber: string;
  }>,
  res: Response
) => {
  try {
    const { competitionId, flightNumber, groupNumber } = req.params;

    const query: any = { competitionId };
    if (flightNumber) query.flightNumber = parseInt(flightNumber);
    if (groupNumber) query.groupNumber = parseInt(groupNumber);

    const results = await Result.find(query)
      .populate("athleteId", "firstName lastName")
      .sort({ "weighIn.lotNumber": 1 });

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No results found for this competition, flight, and group",
      });
    }

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching results",
    });
  }
};

// Get results by competition and multiple athletes
export const getResultsByCompetitionAndAthletes = async (
  req: AuthenticatedRequest<
    { competitionId: string },
    {},
    { athleteIds: string[] }
  >,
  res: Response
) => {
  try {
    const { competitionId } = req.params;
    const { athleteIds } = req.body;

    if (!Array.isArray(athleteIds) || athleteIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "athleteIds must be a non-empty array",
      });
    }

    const results = await Result.find({
      competitionId,
      athleteId: { $in: athleteIds },
    })
      .populate("athleteId", "firstName lastName")
      .sort({ "weighIn.lotNumber": 1 });

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching results",
    });
  }
};
