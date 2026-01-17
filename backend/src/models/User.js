import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    tgId: { type: String, unique: true, index: true },
    username: { type: String, default: "" },
    firstName: { type: String, default: "" },
    balance: { type: Number, default: 0 },
    referrerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    referralsCount: { type: Number, default: 0 },
    lastSeenAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
