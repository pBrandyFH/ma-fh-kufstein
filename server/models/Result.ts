import mongoose, { type Document, Schema } from "mongoose"

interface ILift {
  attempt1: number | null
  attempt2: number | null
  attempt3: number | null
  best: number | null
}

export interface IResult extends Document {
  competitionId: mongoose.Types.ObjectId
  athleteId: mongoose.Types.ObjectId
  weightCategory: string
  ageCategory: string
  bodyweight: number
  squat: ILift
  bench: ILift
  deadlift: ILift
  total: number
  wilks: number
  ipfPoints: number
  place: number
  createdAt: Date
  updatedAt: Date
}

const LiftSchema = new Schema<ILift>({
  attempt1: {
    type: Number,
    default: null,
  },
  attempt2: {
    type: Number,
    default: null,
  },
  attempt3: {
    type: Number,
    default: null,
  },
  best: {
    type: Number,
    default: null,
  },
})

const ResultSchema = new Schema<IResult>(
  {
    competitionId: {
      type: Schema.Types.ObjectId,
      ref: "Competition",
      required: true,
    },
    athleteId: {
      type: Schema.Types.ObjectId,
      ref: "Athlete",
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
    bodyweight: {
      type: Number,
      required: true,
    },
    squat: {
      type: LiftSchema,
      required: true,
      default: () => ({}),
    },
    bench: {
      type: LiftSchema,
      required: true,
      default: () => ({}),
    },
    deadlift: {
      type: LiftSchema,
      required: true,
      default: () => ({}),
    },
    total: {
      type: Number,
      default: 0,
    },
    wilks: {
      type: Number,
      default: 0,
    },
    ipfPoints: {
      type: Number,
      default: 0,
    },
    place: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
)

// Create a compound index to ensure an athlete can only have one result per competition
ResultSchema.index({ athleteId: 1, competitionId: 1 }, { unique: true })

export default mongoose.model<IResult>("Result", ResultSchema)

