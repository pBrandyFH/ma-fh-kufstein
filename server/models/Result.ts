import mongoose, { Document, Schema } from "mongoose"
import { Result as IResult } from "../types"

interface IAttempt {
  weight: number | null
  status: "pending" | "good" | "noGood" | null
  timestamp: Date | null
}

interface IWeighIn {
  bodyweight: number | null
  lotNumber: number | null
  timestamp: Date | null
}

// Define the document methods interface
export interface IResultDocumentMethods {
  calculateTotals(): void;
}

// Update the document interface to include methods
export interface IResultDocument extends Omit<IResult, 'squat' | 'bench' | 'deadlift'>, Document, IResultDocumentMethods {
  nominationId: mongoose.Types.ObjectId;
  flightId?: mongoose.Types.ObjectId;
  groupId?: mongoose.Types.ObjectId;
  weighIn: IWeighIn
  attempts: {
    squat: IAttempt[]
    bench: IAttempt[]
    deadlift: IAttempt[]
  }
  best: {
    squat: number | null
    bench: number | null
    deadlift: number | null
  }
}

const AttemptSchema = new Schema<IAttempt>({
  weight: {
    type: Number,
    default: null,
  },
  status: {
    type: String,
    enum: ["pending", "good", "noGood", null],
    default: null,
  },
  timestamp: {
    type: Date,
    default: null,
  },
})

const WeighInSchema = new Schema<IWeighIn>({
  bodyweight: {
    type: Number,
    default: null,
  },
  lotNumber: {
    type: Number,
    default: null,
  },
  timestamp: {
    type: Date,
    default: null,
  },
})

const ResultSchema = new Schema<IResultDocument>(
  {
    nominationId: {
      type: Schema.Types.ObjectId,
      ref: "Nomination",
      required: true,
    },
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
      enum: ["SUB_JUNIORS", "JUNIORS", "OPEN", "MASTERS_1", "MASTERS_2", "MASTERS_3", "MASTERS_4"],
      required: true,
    },
    flightId: {
      type: Schema.Types.ObjectId,
      ref: "Flight",
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
    },
    weighIn: {
      type: WeighInSchema,
      default: () => ({}),
    },
    attempts: {
      squat: {
        type: [AttemptSchema],
        default: () => Array(3).fill({}),
      },
      bench: {
        type: [AttemptSchema],
        default: () => Array(3).fill({}),
      },
      deadlift: {
        type: [AttemptSchema],
        default: () => Array(3).fill({}),
      },
    },
    best: {
      squat: {
        type: Number,
        default: null,
      },
      bench: {
        type: Number,
        default: null,
      },
      deadlift: {
        type: Number,
        default: null,
      },
    },
    total: {
      type: Number,
      default: null,
    },
    wilks: {
      type: Number,
      default: null,
    },
    ipfPoints: {
      type: Number,
      default: null,
    },
    place: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Compound index for unique athlete-competition combination
ResultSchema.index({ athleteId: 1, competitionId: 1 }, { unique: true })

// Update index for efficient querying by competition, flight, and group
ResultSchema.index({ competitionId: 1, flightId: 1, groupId: 1 })

// Helper method to calculate best lifts and total
ResultSchema.methods.calculateTotals = function() {
  this.best.squat = this.attempts.squat.reduce((best: number | null, attempt: IAttempt) => 
    attempt.status === "good" && attempt.weight && (!best || attempt.weight > best) ? attempt.weight : best, 
    null as number | null
  );
  
  this.best.bench = this.attempts.bench.reduce((best: number | null, attempt: IAttempt) => 
    attempt.status === "good" && attempt.weight && (!best || attempt.weight > best) ? attempt.weight : best, 
    null as number | null
  );
  
  this.best.deadlift = this.attempts.deadlift.reduce((best: number | null, attempt: IAttempt) => 
    attempt.status === "good" && attempt.weight && (!best || attempt.weight > best) ? attempt.weight : best, 
    null as number | null
  );

  if (this.best.squat && this.best.bench && this.best.deadlift) {
    this.total = this.best.squat + this.best.bench + this.best.deadlift;
    // TODO: Calculate Wilks and IPF points
  }
};

// Update the model creation to include methods type
const Result = mongoose.model<IResultDocument, mongoose.Model<IResultDocument, {}, IResultDocumentMethods>>("Result", ResultSchema)

export default Result

