import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User } from "../models/User.js";
import { getSingletonSettings } from "../models/Settings.js";
import { requireUser } from "../middleware/userAuth.js";
import { CollectSession } from "../models/CollectSession.js";
import { Task } from "../models/Task.js";
import { TaskCompletion } from "../models/TaskCompletion.js";
import { Withdrawal } from "../models/Withdrawal.js";
import { notifyAdmin } from "../utils/botNotify.js";

export const userRouter = express.Router();

// NOTE: This is a minimal auth for demo.
// In production, verify Telegram initData signature.
userRouter.post("/auth/telegram", async (req, res) => {
  const schema = z.object({
    tgId: z.string().min(1),
    username: z.string().optional(),
    firstName: z.string().optional(),
    referrerTgId: z.string().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const { tgId, username = "", firstName = "", referrerTgId } = parsed.data;

  let user = await User.findOne({ tgId });
  if (!user) {
    let referrer = null;
    if (referrerTgId) referrer = await User.findOne({ tgId: referrerTgId });

    user = await User.create({ tgId, username, firstName, referrerUserId: referrer?._id ?? null });

    // referral reward
    if (referrer) {
      const s = await getSingletonSettings();
      referrer.balance = +(referrer.balance + s.referralReward).toFixed(6);
      referrer.referralsCount += 1;
      await referrer.save();
    }
  }

  user.username = username;
  user.firstName = firstName;
  user.lastSeenAt = new Date();
  await user.save();

  const token = jwt.sign(
    { userId: user._id.toString(), tgId: user.tgId },
    process.env.USER_JWT_SECRET,
    { expiresIn: "30d" }
  );
  res.json({ token });
});

userRouter.get("/me", requireUser, async (req, res) => {
  const u = await User.findById(req.user.userId);
  if (!u) return res.status(404).json({ error: "Not found" });
  res.json(u);
});

userRouter.get("/settings", requireUser, async (_, res) => {
  const s = await getSingletonSettings();
  res.json(s);
});

// Collect session
userRouter.post("/collect/start", requireUser, async (req, res) => {
  const s = await getSingletonSettings();
  const userId = req.user.userId;

  // Only allow if no active session
  const active = await CollectSession.findOne({ userId, status: { $in: ["running", "claimable"] } }).sort({ createdAt: -1 });
  if (active) {
    // update status if time passed
    const now = new Date();
    if (active.status === "running" && now >= active.endAt) {
      active.status = "claimable";
      await active.save();
    }
    return res.json(active);
  }

  const startAt = new Date();
  const endAt = new Date(Date.now() + s.collectDurationSec * 1000);
  const session = await CollectSession.create({
    userId,
    startAt,
    endAt,
    rewardAmount: s.collectReward,
    status: "running"
  });

  res.json(session);
});

userRouter.post("/collect/claim", requireUser, async (req, res) => {
  const userId = req.user.userId;
  const now = new Date();

  const session = await CollectSession.findOne({ userId, status: { $in: ["running", "claimable"] } }).sort({ createdAt: -1 });
  if (!session) return res.status(400).json({ error: "No session" });

  if (session.status === "running" && now < session.endAt) {
    return res.status(400).json({ error: "Not finished" });
  }

  if (session.status !== "claimed") {
    session.status = "claimed";
    session.claimedAt = now;
    await session.save();

    const u = await User.findById(userId);
    if (u) {
      u.balance = +(u.balance + session.rewardAmount).toFixed(6);
      u.lastSeenAt = now;
      await u.save();
      return res.json({ ok: true, balance: u.balance, reward: session.rewardAmount });
    }
  }

  res.json({ ok: true });
});

// Tasks
userRouter.get("/tasks", requireUser, async (req, res) => {
  const userId = req.user.userId;
  const tasks = await Task.find({ active: true }).sort({ sortOrder: 1, createdAt: -1 });
  const done = await TaskCompletion.find({ userId }).select("taskId");
  const doneSet = new Set(done.map((d) => d.taskId.toString()));
  res.json(tasks.map((t) => ({
    ...t.toObject(),
    done: doneSet.has(t._id.toString())
  })));
});

userRouter.post("/tasks/complete", requireUser, async (req, res) => {
  const schema = z.object({ taskId: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const userId = req.user.userId;
  const task = await Task.findById(parsed.data.taskId);
  if (!task || !task.active) return res.status(404).json({ error: "Task not found" });

  try {
    await TaskCompletion.create({ taskId: task._id, userId, rewardAmount: task.rewardAmount });
  } catch {
    return res.status(400).json({ error: "Already completed" });
  }

  const u = await User.findById(userId);
  if (u) {
    u.balance = +(u.balance + task.rewardAmount).toFixed(6);
    u.lastSeenAt = new Date();
    await u.save();
  }

  res.json({ ok: true, reward: task.rewardAmount, balance: u?.balance ?? 0 });
});

// Referrals list
userRouter.get("/referrals", requireUser, async (req, res) => {
  const userId = req.user.userId;
  const u = await User.findById(userId);
  if (!u) return res.status(404).json({ error: "Not found" });

  const referred = await User.find({ referrerUserId: u._id }).select("username firstName createdAt");
  const s = await getSingletonSettings();
  const total = referred.length * s.referralReward;

  res.json({
    link: `https://t.me/${process.env.BOT_USERNAME || "YourBot"}?start=ref_${u.tgId}`,
    count: referred.length,
    totalEarned: +total.toFixed(6),
    referralReward: s.referralReward,
    users: referred
  });
});

// Withdraw
userRouter.post("/withdraw", requireUser, async (req, res) => {
  const schema = z.object({
    address: z.string().min(10).max(200),
    amount: z.number().min(0.000001)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const s = await getSingletonSettings();
  if (parsed.data.amount < s.minWithdraw) return res.status(400).json({ error: "Below minimum" });

  const u = await User.findById(req.user.userId);
  if (!u) return res.status(404).json({ error: "Not found" });
  if (u.balance < parsed.data.amount) return res.status(400).json({ error: "Insufficient balance" });

  // subtract immediately (simple approach)
  u.balance = +(u.balance - parsed.data.amount).toFixed(6);
  u.lastSeenAt = new Date();
  await u.save();

  const w = await Withdrawal.create({
    userId: u._id,
    address: parsed.data.address,
    amount: parsed.data.amount,
    status: "pending"
  });

  await notifyAdmin(
    `New withdrawal request (#${w._id})\nUser: @${u.username || ""} (${u.tgId})\nAmount: ${w.amount} TON\nAddress: ${w.address}`
  );

  res.json({ ok: true, withdrawal: w, balance: u.balance });
});

userRouter.get("/withdrawals", requireUser, async (req, res) => {
  const list = await Withdrawal.find({ userId: req.user.userId }).sort({ createdAt: -1 }).limit(100);
  res.json(list);
});
