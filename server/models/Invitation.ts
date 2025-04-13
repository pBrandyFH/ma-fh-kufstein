import mongoose, { type Document, Schema } from "mongoose"
import type { UserRole } from "../types"
import { RoleType } from "../permissions/types"

export interface IInvitation extends Document {
  email: string
  inviteCode: string
  role: RoleType
  federationId?: mongoose.Types.ObjectId
  clubId?: mongoose.Types.ObjectId
  invitedBy: mongoose.Types.ObjectId
  firstName?: string
  lastName?: string
  expiresAt: Date
  used: boolean
  createdAt: Date
  updatedAt: Date
}

const InvitationSchema = new Schema<IInvitation>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      required: true,
    },
    federationId: {
      type: Schema.Types.ObjectId,
      ref: "Federation",
    },
    clubId: {
      type: Schema.Types.ObjectId,
      ref: "Club",
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model<IInvitation>("Invitation", InvitationSchema)

