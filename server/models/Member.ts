import mongoose, { type Document, Schema } from "mongoose";

export type MemberType = "CLUB" | "INDIVIDUAL" | "UNIVERSITY";

export interface IMember extends Document {
  name: string;
  federation: mongoose.Types.ObjectId;
  athletes: mongoose.Types.ObjectId[];
  type: MemberType;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    federation: {
      type: Schema.Types.ObjectId,
      ref: "Federation",
      required: true,
    },
    type: {
      type: String,
      enum: ["CLUB", "INDIVIDUAL", "UNIVERSITY"],
      required: true,
    },
    athletes: [
        {
            type: Schema.Types.ObjectId,
            ref: "Athlete"
        }
    ]
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMember>("Member", MemberSchema);
