// models/workoutModel.js
import mongoose from "mongoose";

const workoutSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    planName: {
      type: String,
      required: true,
    },
    planData: {
      type: Object,
      required: true,
    },
    userInputs: {
      type: Object,
      required: true,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const WorkoutPlans = mongoose.model("WorkoutPlans", workoutSchema);

export default WorkoutPlans;
