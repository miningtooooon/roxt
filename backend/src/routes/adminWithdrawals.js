import express from "express";
import { requireAdmin } from "../middleware/adminAuth.js";
import { Withdrawal } from "../models/Withdrawal.js";
import { User } from "../models/User.js";
import { z } from "zod";
import { notifyAdmin } from "../utils/botNotify.js";

export const adminWithdrawalsRouter = express.Router();

adminWithdrawalsRouter.get("/", requireAdmin, async (req, res) => {
  const status = req.query.status;
  const q = status ? { status } : {};
  const list = await Withdrawal.find(q).sort({ createdAt: -1 }).limit(500).populate("userId", "tgId username firstName");
  res.json(list);
});

adminWithdrawalsRouter.patch("/:id", requireAdmin, async (req, res) => {
  const schema = z.object({
    status: z.enum(["pending", "paid", "rejected"]),
    adminNote: z.string().max(500).optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const w = await Withdrawal.findById(req.params.id);
  if (!w) return res.status(404).json({ error: "Not found" });

  w.status = parsed.data.status;
  if (typeof parsed.data.adminNote === "string") w.adminNote = parsed.data.adminNote;
  await w.save();

  const u = await User.findById(w.userId);
  if (u) {
    await notifyAdmin(`Withdrawal updated (#${w._id})\nUser: @${u.username || ""} (${u.tgId})\nAmount: ${w.amount}\nStatus: ${w.status}`);
  }

  res.json(w);
});
