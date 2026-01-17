import express from "express";
import { requireAdmin } from "../middleware/adminAuth.js";
import { User } from "../models/User.js";
import { Withdrawal } from "../models/Withdrawal.js";
import { TaskCompletion } from "../models/TaskCompletion.js";

export const adminStatsRouter = express.Router();

adminStatsRouter.get("/", requireAdmin, async (_, res) => {
  const totalUsers = await User.countDocuments();
  const pendingWithdrawals = await Withdrawal.countDocuments({ status: "pending" });
  const totalWithdrawals = await Withdrawal.countDocuments();
  const totalTaskCompletions = await TaskCompletion.countDocuments();

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const active24h = await User.countDocuments({ lastSeenAt: { $gte: since } });

  res.json({
    totalUsers,
    active24h,
    pendingWithdrawals,
    totalWithdrawals,
    totalTaskCompletions
  });
});

adminStatsRouter.get("/users", requireAdmin, async (req, res) => {
  const q = (req.query.q || "").toString().trim();
  const filter = q
    ? { $or: [{ tgId: q }, { username: new RegExp(q, "i") }, { firstName: new RegExp(q, "i") }] }
    : {};
  const users = await User.find(filter).sort({ createdAt: -1 }).limit(500);
  res.json(users);
});
