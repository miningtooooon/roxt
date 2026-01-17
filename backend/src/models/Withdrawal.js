import mongoose from "mongoose";

const WithdrawalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    address: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "paid", "rejected"], default: "pending" },
    adminNote: { type: String, default: "" }
  },
  { timestamps: true }
);

export const Withdrawal = mongoose.model("Withdrawal", WithdrawalSchema);
