import mongoose from "mongoose";

const CollectSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    claimedAt: { type: Date, default: null },
    rewardAmount: { type: Number, required: true },
    status: { type: String, enum: ["running", "claimable", "claimed"], default: "running" }
  },
  { timestamps: true }
);

export const CollectSession = mongoose.model("CollectSession", CollectSessionSchema);
