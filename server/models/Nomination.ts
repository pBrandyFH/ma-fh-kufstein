import mongoose, { type Document, Schema } from "mongoose"

export interface INomination extends Document {
  athleteId: mongoose.Types.ObjectId
  competitionId: mongoose.Types.ObjectId
  weightCategory: string
  ageCategory: string
  status: string
  nominatedBy: mongoose.Types.ObjectId
  nominatedAt: Date
  updatedAt: Date
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
      enum: ["subJuniors", "juniors", "open", "masters1", "masters2", "masters3", "masters4", "masters"],
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
  },
)

// Create a compound index to ensure an athlete can only be nominated once per competition
NominationSchema.index({ athleteId: 1, competitionId: 1 }, { unique: true })

export default mongoose.model<INomination>("Nomination", NominationSchema)

