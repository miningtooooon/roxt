import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["adsgram", "monetag", "external", "join_channel", "start_bot"],
      required: true
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    rewardAmount: { type: Number, default: 0.001 },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Task = mongoose.model("Task", TaskSchema);
