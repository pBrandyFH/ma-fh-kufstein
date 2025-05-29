import type { Response } from "express";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "./authController";
import Member, { MemberType } from "../models/Member";

interface CreateMemberRequestBody {
  name: string;
  federationId: mongoose.Types.ObjectId;
  type: MemberType;
  adminId?: mongoose.Types.ObjectId;
}

interface UpdateMemberRequestBody extends Partial<CreateMemberRequestBody> {}

export const getMemberById = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response
) => {
  try {
    const member = await Member.findById(
      new mongoose.Types.ObjectId(req.params.id)
    )
      .populate("athletes")
      .populate("federation");

    if (!member) {
      return res.status(404).json({
        success: false,
        error: "Member not found",
      });
    }

    res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error) {
    console.error("Get member by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching member",
    });
  }
};

export const getMembersByFederationId = async (
  req: AuthenticatedRequest<{ federationId: string }>,
  res: Response
) => {
  try {
    const members = await Member.find({
      federation: req.params.federationId,
    }).populate<{
      federation: { name: string; abbreviation: string; type: string };
    }>("federation", "name abbreviation type");
    
    //   .populate("athletes");

    if (!members) {
      return res.status(404).json({
        success: false,
        error: "No members found for this federation",
      });
    }

    res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("Get members by federation ID error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching members",
    });
  }
};

// --------------------------------------------------------------------------------------------------------------
// CREATE REQUESTS
// --------------------------------------------------------------------------------------------------------------

export const createMember = async (
  req: AuthenticatedRequest<{}, {}, CreateMemberRequestBody>,
  res: Response
) => {
  try {
    const { name, type, federationId, adminId } = req.body;

    const member = new Member({
      name,
      federationId,
      type,
      adminId,
    });

    await member.save();

    res.status(201).json({
      success: true,
      data: member,
    });
  } catch (error) {
    console.error("Create member error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while creating member",
    });
  }
};

// --------------------------------------------------------------------------------------------------------------
// UPDATE REQUESTS
// --------------------------------------------------------------------------------------------------------------

export const updateMember = async (
  req: AuthenticatedRequest<{ id: string }, {}, UpdateMemberRequestBody>,
  res: Response
) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        error: "Member not found",
      });
    }

    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("athletes");

    res.status(200).json({
      success: true,
      data: updatedMember,
    });
  } catch (error) {
    console.error("Update member error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while updating member",
    });
  }
};

// --------------------------------------------------------------------------------------------------------------
// DELETE REQUESTS
// --------------------------------------------------------------------------------------------------------------

export const deleteMember = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response
) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        error: "Member not found",
      });
    }

    if (member.athletes.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete member with athletes. Remove athletes first.",
      });
    }

    // If no athletes, proceed with deletion
    await member.deleteOne();

    res.status(200).json({
      success: true,
      message: "Member deleted successfully",
    });
  } catch (error) {
    console.error("Delete member error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while deleting member",
    });
  }
};
