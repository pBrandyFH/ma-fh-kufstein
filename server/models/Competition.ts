import mongoose, { type Document, Schema } from "mongoose";

export type EquipmentType = "CLASSIC" | "SINGLE" | "BP_CLASSIC" | "BP_SINGLE";
export type AgeCategory =
  | "SUB_JUNIORS"
  | "JUNIORS"
  | "OPEN"
  | "MASTERS_1"
  | "MASTERS_2"
  | "MASTERS_3"
  | "MASTERS_4";
export type CompetitionStatus = "upcoming" | "ongoing" | "completed";

export interface ICompetition extends Document {
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
  ageCategories: AgeCategory[];
  description?: string;
  status: CompetitionStatus;
  nominationDeadline: Date;
  officials?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CompetitionSchema = new Schema<ICompetition>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    hostFederation: {
      type: Schema.Types.ObjectId,
      ref: "Federation",
      required: true,
    },
    hostMember: {
      type: Schema.Types.ObjectId,
      ref: "Club",
    },
    eligibleFederations: [
      {
        type: Schema.Types.ObjectId,
        ref: "Federation",
      },
    ],
    equipmentType: {
      type: String,
      enum: ["CLASSIC", "SINGLE", "BP_CLASSIC", "BP_SINGLE"],
      required: true,
    },
    ageCategories: [
      {
        type: String,
        enum: [
          "SUB_JUNIORS",
          "JUNIORS",
          "OPEN",
          "MASTERS_1",
          "MASTERS_2",
          "MASTERS_3",
          "MASTERS_4",
        ],
        required: true,
      },
    ],
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming",
      required: true,
    },
    nominationDeadline: {
      type: Date,
      required: true,
    },
    officials: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICompetition>("Competition", CompetitionSchema);
