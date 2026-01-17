import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { z } from "zod";

export const adminAuthRouter = express.Router();

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
});

adminAuthRouter.post("/login", limiter, async (req, res) => {
  const schema = z.object({ code: z.string().min(4).max(128) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const hash = process.env.ADMIN_CODE_HASH;
  const jwtSecret = process.env.ADMIN_JWT_SECRET;
  if (!hash || !jwtSecret) return res.status(500).json({ error: "Server not configured" });

  const ok = await bcrypt.compare(parsed.data.code, hash);
  if (!ok) return res.status(401).json({ error: "Wrong code" });

  const token = jwt.sign({ role: "admin" }, jwtSecret, { expiresIn: "7d" });
  res.json({ token });
});
