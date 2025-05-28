import type { Response } from "express";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "./authController";
import Nomination, { WeightCategory } from "../models/Nomination";
import Athlete from "../models/Athlete";
import Competition, { AgeCategory } from "../models/Competition";
import { isEligibleForAgeCategory } from "../utils/athleteService";

interface CreateMemberRequestBody {
  athleteId: mongoose.Types.ObjectId;
  competitionId: mongoose.Types.ObjectId;
  weightCategory: WeightCategory;
  ageCategory: AgeCategory;
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
  req: AuthenticatedRequest<{}, {}, CreateMemberRequestBody>,
  res: Response
) => {
  try {
    const { athleteId, competitionId, weightCategory, ageCategory } = req.body;

    const athlete = await Athlete.findById(athleteId);
    const competition = await Competition.findById(competitionId);

    if (!athlete) {
      return res.status(404).json({
        success: false,
        error: "Athlete not found",
      });
    }

    if (!competition) {
      return res.status(404).json({
        success: false,
        error: "Athlete not found",
      });
    }

    if (!competition.ageCategories.includes(ageCategory)) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Competition does not support age category",
        });
    }

    if (!isEligibleForAgeCategory(athlete?.dateOfBirth, ageCategory)) {
      return res
        .status(400)
        .json({ success: false, error: "Athlete not in age category" });
    }

    const nomination = new Nomination({
      athleteId,
      competitionId,
      ageCategory,
      weightCategory,
    });

    await nomination.save();

    res.status(201).json({
      success: true,
      data: nomination,
    });
  } catch (error) {
    console.error("Create member error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while creating member",
    });
  }
};
