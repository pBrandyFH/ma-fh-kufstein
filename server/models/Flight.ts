import mongoose, { type Document, Schema } from "mongoose";
import Group from "./Group";

export type FlightStatus = "pending" | "inProgress" | "completed";

export interface IFlight extends Document {
  competitionId: mongoose.Types.ObjectId;
  number: number;
  status: FlightStatus;
  startTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FlightSchema = new Schema<IFlight>(
  {
    competitionId: {
      type: Schema.Types.ObjectId,
      ref: "Competition",
      required: true,
    },
    number: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["pending", "inProgress", "completed"],
      default: "pending",
      required: true,
    },
    startTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create a compound index to ensure flight numbers are unique within a competition
FlightSchema.index({ competitionId: 1, number: 1 }, { unique: true });

// Add virtual field for groups
FlightSchema.virtual('groups', {
  ref: 'Group',
  localField: '_id',
  foreignField: 'flightId'
});

export default mongoose.model<IFlight>("Flight", FlightSchema);
