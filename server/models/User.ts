import mongoose, { type Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { UserFederationRole } from "../permissions/types";

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  federationRoles: UserFederationRole[];
  // Old fields for migration
  role?: string;
  federationId?: string;
  clubId?: string;
  athleteId?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
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
    federationRoles: {
      type: [
        {
          federationId: {
            type: String,
            required: true,
          },
          role: {
            type: String,
            required: true,
          },
          overridePermissions: {
            type: [String],
            required: false,
          },
        },
      ],
      default: [],
      required: true,
    },
    // Old fields for migration
    role: String,
    federationId: String,
    clubId: String,
    athleteId: String
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
