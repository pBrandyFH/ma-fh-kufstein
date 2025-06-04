import type { Response } from "express";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "./authController";
import Flight, { FlightStatus, IFlight } from "../models/Flight";
import Group, { IGroup } from "../models/Group";
import Nomination from "../models/Nomination";
import Result from "../models/Result";

interface CreateFlightRequestBody {
  competitionId: string;
  number: number;
  startTime?: Date;
  groups: Array<{
    number: number;
    name: string;
    startTime?: Date;
    nominationIds: string[];
  }>;
}

interface UpdateFlightStatusRequestBody {
  status: FlightStatus;
}

// Helper function to validate user authentication
function validateUserAuthentication(userId?: string): {
  valid: boolean;
  error?: string;
} {
  if (!userId) {
    return {
      valid: false,
      error: "User must be authenticated to manage flights",
    };
  }
  return { valid: true };
}

// Helper function to calculate flight status based on results
async function calculateFlightStatus(flightId: string): Promise<FlightStatus> {
  // Get all groups in this flight
  const groups = await Group.find({ flightId });
  const groupIds = groups.map((g) => g._id);

  // Get all nominations in these groups
  const nominations = await Nomination.find({ groupId: { $in: groupIds } });
  if (nominations.length === 0) {
    return "pending";
  }

  // Get all results for these nominations
  const results = await Result.find({
    nominationId: { $in: nominations.map((n) => n._id) },
  });

  if (results.length === 0) {
    return "pending";
  }

  // Check if any athlete has started (has weigh-in or any attempt)
  const anyStarted = results.some(
    (result) =>
      result.weighIn?.bodyweight != null ||
      ["squat", "bench", "deadlift"].some((liftType) =>
        result.attempts[liftType as keyof typeof result.attempts].some(
          (attempt) => attempt.weight != null
        )
      )
  );

  if (!anyStarted) {
    return "pending";
  }

  // Check if all athletes have completed their lifts
  const allCompleted = nominations.every((nomination) => {
    const result = results.find(
      (r) =>
        (typeof r.nominationId === "string"
          ? r.nominationId
          : r.nominationId._id
        ).toString() === nomination._id.toString()
    );

    if (!result) return false;

    // Check if all lifts are completed (all attempts have a status)
    return ["squat", "bench", "deadlift"].every((liftType) => {
      const attempts = result.attempts[liftType as keyof typeof result.attempts];
      // Check if all 3 attempts exist and have a status
      return attempts.length === 3 && attempts.every(
        (attempt) => attempt.status === "good" || attempt.status === "noGood"
      );
    });
  });

  return allCompleted ? "completed" : "inProgress";
}

export const createFlight = async (
  req: AuthenticatedRequest<{}, {}, CreateFlightRequestBody>,
  res: Response
) => {
  try {
    const { competitionId, number, startTime, groups } = req.body;
    const userId = req.user?.id;

    const authValidation = validateUserAuthentication(userId);
    if (!authValidation.valid) {
      return res.status(401).json({
        success: false,
        error: authValidation.error,
      });
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create the flight
      const flight = new Flight({
        competitionId,
        number,
        startTime,
        status: "pending",
      });
      await flight.save({ session });

      // Create groups and update nominations
      for (const groupData of groups) {
        const group = new Group({
          flightId: flight._id,
          number: groupData.number,
          name: groupData.name,
          startTime: groupData.startTime,
        });
        await group.save({ session });

        // Update nominations with the new group
        await Nomination.updateMany(
          { _id: { $in: groupData.nominationIds } },
          { $set: { groupId: group._id } },
          { session }
        );
      }

      await session.commitTransaction();
      session.endSession();

      // Fetch the created flight with populated data
      const populatedFlight = await Flight.findById(flight._id).populate({
        path: "groups",
        populate: {
          path: "nominations",
          populate: "athleteId",
        },
      });

      res.status(201).json({
        success: true,
        data: populatedFlight,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Create flight error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while creating flight",
    });
  }
};

export const getFlightsByCompetition = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response
) => {
  try {
    const flights = await Flight.find({ competitionId: req.params.id })
      .populate({
        path: "groups",
        populate: {
          path: "nominations",
          populate: "athleteId",
        },
      })
      .sort({ number: 1 });

    if (!flights) {
      return res.status(404).json({
        success: false,
        error: "No flights found for this competition",
      });
    }

    res.status(200).json({
      success: true,
      data: flights,
    });
  } catch (error) {
    console.error("Get flights error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching flights",
    });
  }
};

export const updateFlightStatus = async (
  req: AuthenticatedRequest<{ id: string }, {}, UpdateFlightStatusRequestBody>,
  res: Response
) => {
  try {
    const { status } = req.body;
    const flightId = req.params.id;
    const userId = req.user?.id;

    const authValidation = validateUserAuthentication(userId);
    if (!authValidation.valid) {
      return res.status(401).json({
        success: false,
        error: authValidation.error,
      });
    }

    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({
        success: false,
        error: "Flight not found",
      });
    }

    // If status is being set to completed, verify it's actually complete
    if (status === "completed") {
      const calculatedStatus = await calculateFlightStatus(flightId);
      if (calculatedStatus !== "completed") {
        return res.status(400).json({
          success: false,
          error: "Cannot mark flight as completed until all lifts are finished",
        });
      }
    }

    flight.status = status;
    await flight.save();

    res.status(200).json({
      success: true,
      data: flight,
    });
  } catch (error) {
    console.error("Update flight status error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while updating flight status",
    });
  }
};

export const recalculateFlightStatus = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response
) => {
  try {
    const flightId = req.params.id;
    const userId = req.user?.id;

    const authValidation = validateUserAuthentication(userId);
    if (!authValidation.valid) {
      return res.status(401).json({
        success: false,
        error: authValidation.error,
      });
    }

    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({
        success: false,
        error: "Flight not found",
      });
    }

    const newStatus = await calculateFlightStatus(flightId);
    flight.status = newStatus;
    await flight.save();

    res.status(200).json({
      success: true,
      data: flight,
    });
  } catch (error) {
    console.error("Recalculate flight status error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while recalculating flight status",
    });
  }
};

export const updateFlight = async (
  req: AuthenticatedRequest<{ id: string }, {}, CreateFlightRequestBody>,
  res: Response
) => {
  try {
    const { id: flightId } = req.params;
    const { startTime, groups } = req.body;
    const userId = req.user?.id;

    const authValidation = validateUserAuthentication(userId);
    if (!authValidation.valid) {
      return res.status(401).json({
        success: false,
        error: authValidation.error,
      });
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find and update the flight
      const flight = await Flight.findById(flightId);
      if (!flight) {
        return res.status(404).json({
          success: false,
          error: "Flight not found",
        });
      }

      // Update only the startTime, not the number
      flight.startTime = startTime;
      await flight.save({ session });

      // Get all existing groups for this flight
      const existingGroups = await Group.find({ flightId });
      const existingGroupIds = existingGroups.map((g) => g._id);

      // First, clear group assignments for all nominations that were in this flight
      await Nomination.updateMany(
        { groupId: { $in: existingGroupIds } },
        { $unset: { groupId: "" } },
        { session }
      );

      // Remove all existing groups for this flight
      await Group.deleteMany({ flightId }, { session });

      // Create new groups and update nominations
      for (const groupData of groups) {
        const group = new Group({
          flightId: flight._id,
          number: groupData.number,
          name: groupData.name,
          startTime: groupData.startTime,
        });
        await group.save({ session });

        // Update nominations with the new group
        if (groupData.nominationIds.length > 0) {
          await Nomination.updateMany(
            { _id: { $in: groupData.nominationIds } },
            { $set: { groupId: group._id } },
            { session }
          );
        }
      }

      await session.commitTransaction();
      session.endSession();

      // Fetch the updated flight with populated data
      const populatedFlight = await Flight.findById(flight._id).populate({
        path: "groups",
        populate: {
          path: "nominations",
          populate: "athleteId",
        },
      });

      res.status(200).json({
        success: true,
        data: populatedFlight,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Update flight error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while updating flight",
    });
  }
};
