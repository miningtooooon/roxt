import mongoose from "mongoose";

const TaskCompletionSchema = new mongoose.Schema(
  {
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    completedAt: { type: Date, default: Date.now },
    rewardAmount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

TaskCompletionSchema.index({ taskId: 1, userId: 1 }, { unique: true });

export const TaskCompletion = mongoose.model("TaskCompletion", TaskCompletionSchema);
