import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    collectDurationSec: { type: Number, default: 3600 },
    collectReward: { type: Number, default: 0.001 },
    referralReward: { type: Number, default: 0.001 },
    minWithdraw: { type: Number, default: 0.001 },

    adsgramCode: { type: String, default: "" },
    monetagCode: { type: String, default: "" },

    features: {
      collect: { type: Boolean, default: true },
      tasks: { type: Boolean, default: true },
      referrals: { type: Boolean, default: true },
      withdraw: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

export const Settings = mongoose.model("Settings", SettingsSchema);

export async function getSingletonSettings() {
  let doc = await Settings.findOne();
  if (!doc) doc = await Settings.create({});
  return doc;
}
