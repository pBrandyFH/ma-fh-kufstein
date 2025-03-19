import mongoose, { type Document, Schema } from "mongoose"

export interface IClub extends Document {
  name: string
  abbreviation: string
  federationId: mongoose.Types.ObjectId
  adminId?: mongoose.Types.ObjectId
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  address?: string
  city?: string
  country?: string
  createdAt: Date
  updatedAt: Date
}

const ClubSchema = new Schema<IClub>(
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
    federationId: {
      type: Schema.Types.ObjectId,
      ref: "Federation",
      required: true,
    },
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
  },
)

export default mongoose.model<IClub>("Club", ClubSchema)

