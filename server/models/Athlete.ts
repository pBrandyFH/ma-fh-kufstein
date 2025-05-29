import mongoose, { type Document, Schema } from "mongoose";

export interface IAthlete extends Document {
  userId?: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  weightCategory: string;
  member: mongoose.Types.ObjectId;
  federation: mongoose.Types.ObjectId;
  coaches?: mongoose.Types.ObjectId[];
  isNationalTeam?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AthleteSchema = new Schema<IAthlete>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
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
    member: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    federation: {
      type: Schema.Types.ObjectId,
      ref: "Federation",
      required: true,
    },
    coaches: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isNationalTeam: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IAthlete>("Athlete", AthleteSchema);
