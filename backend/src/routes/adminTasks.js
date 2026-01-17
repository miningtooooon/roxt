import express from "express";
import { requireAdmin } from "../middleware/adminAuth.js";
import { Task } from "../models/Task.js";
import { z } from "zod";

export const adminTasksRouter = express.Router();

adminTasksRouter.get("/", requireAdmin, async (_, res) => {
  const tasks = await Task.find().sort({ sortOrder: 1, createdAt: -1 });
  res.json(tasks);
});

adminTasksRouter.post("/", requireAdmin, async (req, res) => {
  const schema = z.object({
    type: z.enum(["adsgram", "monetag", "external", "join_channel", "start_bot"]),
    title: z.string().min(2).max(200),
    description: z.string().max(500).optional(),
    rewardAmount: z.number().min(0).max(100),
    payload: z.any().optional(),
    active: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(9999).optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const task = await Task.create(parsed.data);
  res.json(task);
});

adminTasksRouter.patch("/:id", requireAdmin, async (req, res) => {
  const schema = z.object({
    title: z.string().min(2).max(200).optional(),
    description: z.string().max(500).optional(),
    rewardAmount: z.number().min(0).max(100).optional(),
    payload: z.any().optional(),
    active: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(9999).optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const task = await Task.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  if (!task) return res.status(404).json({ error: "Not found" });
  res.json(task);
});

adminTasksRouter.delete("/:id", requireAdmin, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});
