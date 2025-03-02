import mongoose from "mongoose";

const ExerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sets: {
    type: String,
    required: true,
  },
  reps: {
    type: String,
    required: true,
  },
  weight: {
    type: Boolean,
    default: false,
  },
  weightPercentage: {
    type: Number,
  },
  notes: {
    type: String,
  },
});

const DaySchema = new mongoose.Schema({
  focus: {
    type: String,
    required: true,
  },
  warmup: {
    type: String,
  },
  exercises: [ExerciseSchema],
  cooldown: {
    type: String,
  },
});

const WorkoutPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  summary: {
    type: String,
    required: true,
  },
  goal: {
    type: String,
    required: true,
    enum: ["weightLoss", "muscleGain", "endurance", "general"],
  },
  fitnessLevel: {
    type: String,
    required: true,
    enum: ["beginner", "intermediate", "advanced"],
  },
  userWeight: {
    type: Number,
    required: true,
  },
  days: [DaySchema],
  isFavorite: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("WorkoutPlan", WorkoutPlanSchema);
