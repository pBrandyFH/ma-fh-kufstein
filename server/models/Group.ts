import mongoose, { type Document, Schema } from "mongoose";
import Nomination from "./Nomination";

export interface IGroup extends Document {
  flightId: mongoose.Types.ObjectId;
  number: number;
  name: string;
  startTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    flightId: {
      type: Schema.Types.ObjectId,
      ref: "Flight",
      required: true,
    },
    number: {
      type: Number,
      required: true,
      min: 1,
    },
    name: {
      type: String,
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

// Create a compound index to ensure group numbers are unique within a flight
GroupSchema.index({ flightId: 1, number: 1 }, { unique: true });

// Add virtual field for nominations
GroupSchema.virtual('nominations', {
  ref: 'Nomination',
  localField: '_id',
  foreignField: 'groupId'
});

export default mongoose.model<IGroup>("Group", GroupSchema);