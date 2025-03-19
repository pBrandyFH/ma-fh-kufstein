import mongoose, { type Document, Schema } from "mongoose"
import bcrypt from "bcryptjs"

export interface IUser extends Document {
  email: string
  password: string
  firstName: string
  lastName: string
  role: string
  federationId?: mongoose.Types.ObjectId
  clubId?: mongoose.Types.ObjectId
  athleteId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
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
    role: {
      type: String,
      enum: [
        "athlete",
        "coach",
        "official",
        "clubAdmin",
        "federalStateAdmin",
        "stateAdmin",
        "continentalAdmin",
        "internationalAdmin",
      ],
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
    athleteId: {
      type: Schema.Types.ObjectId,
      ref: "Athlete",
    },
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model<IUser>("User", UserSchema)

