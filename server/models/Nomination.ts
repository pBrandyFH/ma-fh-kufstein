import mongoose, { type Document, Schema } from "mongoose";
import { AgeCategory } from "./Competition";

type NominationStatus = "pending" | "approved" | "rejected";

export type WeightCategory =
  | "u43"
  | "u47"
  | "u52"
  | "u57"
  | "u63"
  | "u69"
  | "u76"
  | "u84"
  | "o84"
  | "u53"
  | "u59"
  | "u66"
  | "u74"
  | "u83"
  | "u93"
  | "u105"
  | "u120"
  | "o120";

export interface INomination extends Document {
  athleteId: mongoose.Types.ObjectId;
  competitionId: mongoose.Types.ObjectId;
  weightCategory: WeightCategory;
  ageCategory: AgeCategory;
  status: NominationStatus;
  nominatedBy: mongoose.Types.ObjectId;
  nominatedAt: Date;
  updatedAt: Date;
}

const NominationSchema = new Schema<INomination>(
  {
    athleteId: {
      type: Schema.Types.ObjectId,
      ref: "Athlete",
      required: true,
    },
    competitionId: {
      type: Schema.Types.ObjectId,
      ref: "Competition",
      required: true,
    },
    weightCategory: {
      type: String,
      enum: [
        "u43",
        "u47",
        "u52",
        "u57",
        "u63",
        "u69",
        "u76",
        "u84",
        "o84", // Female
        "u53",
        "u59",
        "u66",
        "u74",
        "u83",
        "u93",
        "u105",
        "u120",
        "o120", // Male
      ],
      required: true,
    },
    ageCategory: {
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
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },
    nominatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nominatedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index to ensure an athlete can only be nominated once per competition
NominationSchema.index({ athleteId: 1, competitionId: 1 }, { unique: true });

export default mongoose.model<INomination>("Nomination", NominationSchema);
