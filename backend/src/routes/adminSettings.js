import express from "express";
import { requireAdmin } from "../middleware/adminAuth.js";
import { getSingletonSettings } from "../models/Settings.js";
import { z } from "zod";

export const adminSettingsRouter = express.Router();

adminSettingsRouter.get("/", requireAdmin, async (_, res) => {
  const s = await getSingletonSettings();
  res.json(s);
});

adminSettingsRouter.patch("/", requireAdmin, async (req, res) => {
  const schema = z.object({
    collectDurationSec: z.number().int().min(30).max(86400).optional(),
    collectReward: z.number().min(0).max(100).optional(),
    referralReward: z.number().min(0).max(100).optional(),
    minWithdraw: z.number().min(0).max(100).optional(),
    adsgramCode: z.string().max(20000).optional(),
    monetagCode: z.string().max(20000).optional(),
    features: z
      .object({
        collect: z.boolean().optional(),
        tasks: z.boolean().optional(),
        referrals: z.boolean().optional(),
        withdraw: z.boolean().optional()
      })
      .optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const s = await getSingletonSettings();
  Object.assign(s, parsed.data);
  await s.save();
  res.json(s);
});
