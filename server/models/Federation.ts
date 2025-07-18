import mongoose, { type Document, Schema } from "mongoose";

import { FederationLevel } from "../permissions/types";

export interface IFederation extends Document {
  name: string;
  abbreviation: string;
  type: FederationLevel;
  parents?: mongoose.Types.ObjectId[];
  adminId?: mongoose.Types.ObjectId;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FederationSchema = new Schema<IFederation>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    abbreviation: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["INTERNATIONAL", "REGIONAL", "NATIONAL", "STATE", "LOCAL"],
      required: true,
    },
    parents: [
      {
        type: Schema.Types.ObjectId,
        ref: "Federation",
      },
    ],
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    contactName: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IFederation>("Federation", FederationSchema);
