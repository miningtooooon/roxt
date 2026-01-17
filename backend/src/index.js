import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDB } from "./db.js";

import { adminAuthRouter } from "./routes/adminAuth.js";
import { adminSettingsRouter } from "./routes/adminSettings.js";
import { adminStatsRouter } from "./routes/adminStats.js";
import { adminTasksRouter } from "./routes/adminTasks.js";
import { adminWithdrawalsRouter } from "./routes/adminWithdrawals.js";
import { userRouter } from "./routes/user.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") ?? ["*"],
    credentials: false
  })
);

app.get("/health", (_, res) => res.json({ ok: true }));

app.use("/admin/auth", adminAuthRouter);
app.use("/admin/settings", adminSettingsRouter);
app.use("/admin/stats", adminStatsRouter);
app.use("/admin/tasks", adminTasksRouter);
app.use("/admin/withdrawals", adminWithdrawalsRouter);

app.use("/api", userRouter);

const PORT = process.env.PORT || 3000;
await connectDB(process.env.MONGODB_URI);

app.listen(PORT, () => console.log(`API running on :${PORT}`));
