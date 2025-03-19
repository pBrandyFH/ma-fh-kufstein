import mongoose, { type Document, Schema } from "mongoose"

export interface ICompetition extends Document {
  name: string
  startDate: Date
  endDate?: Date
  location: string
  address?: string
  city: string
  country: string
  hostFederationId: mongoose.Types.ObjectId
  hostClubId?: mongoose.Types.ObjectId
  eligibleFederationIds: mongoose.Types.ObjectId[]
  equipmentType: string
  ageCategories: string[]
  description?: string
  status: string
  nominationDeadline: Date
  officialIds?: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
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
    hostFederationId: {
      type: Schema.Types.ObjectId,
      ref: "Federation",
      required: true,
    },
    hostClubId: {
      type: Schema.Types.ObjectId,
      ref: "Club",
    },
    eligibleFederationIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Federation",
      },
    ],
    equipmentType: {
      type: String,
      enum: ["equipped", "classic", "equippedBench", "classicBench"],
      required: true,
    },
    ageCategories: [
      {
        type: String,
        enum: ["subJuniors", "juniors", "open", "masters1", "masters2", "masters3", "masters4", "masters"],
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
    officialIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
)

export default mongoose.model<ICompetition>("Competition", CompetitionSchema)

