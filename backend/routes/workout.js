import express from "express";
import { protect as auth } from "../middleware/authMiddleware.js";
import WorkoutPlan from "../models/WorkoutPlan.js";
import generateWorkoutPlan from "../utils/planGenerator.js";

const router = express.Router();

// Generate a workout plan
router.post("/generate", async (req, res) => {
  try {
    const { weight, goal, fitnessLevel, daysPerWeek, limitations } = req.body;

    // Generate plan using workout generator utility
    const plan = generateWorkoutPlan(
      weight,
      goal,
      fitnessLevel,
      daysPerWeek,
      limitations
    );

    res.json(plan);
  } catch (error) {
    console.error("Generate workout error:", error);
    res.status(500).json({ message: "Error generating workout plan" });
  }
});

// Save a generated workout plan
router.post("/save", auth, async (req, res) => {
  try {
    const { planData, userInputs } = req.body;

    const workoutPlan = new WorkoutPlan({
      userId: req.userId,
      summary: planData.summary,
      goal: userInputs.goal,
      fitnessLevel: userInputs.fitnessLevel,
      userWeight: userInputs.weight,
      days: planData.days,
    });

    await workoutPlan.save();

    res.status(201).json(workoutPlan);
  } catch (error) {
    console.error("Save workout error:", error);
    res.status(500).json({ message: "Error saving workout plan" });
  }
});

// Get user's workout plans
router.get("/history", auth, async (req, res) => {
  try {
    const workoutPlans = await WorkoutPlan.find({ userId: req.userId }).sort({
      createdAt: -1,
    });

    res.json(workoutPlans);
  } catch (error) {
    console.error("Get workouts error:", error);
    res.status(500).json({ message: "Error retrieving workout plans" });
  }
});

// Toggle favorite status of a workout plan
router.post("/favorite", auth, async (req, res) => {
  try {
    const { planId } = req.body;

    const plan = await WorkoutPlan.findOne({
      _id: planId,
      userId: req.userId,
    });

    if (!plan) {
      return res.status(404).json({ message: "Workout plan not found" });
    }

    plan.isFavorite = !plan.isFavorite;
    await plan.save();

    res.json({
      message: "Favorite status updated",
      isFavorite: plan.isFavorite,
    });
  } catch (error) {
    console.error("Favorite workout error:", error);
    res.status(500).json({ message: "Error updating favorite status" });
  }
});

// Delete a workout plan
router.delete("/:planId", auth, async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOneAndDelete({
      _id: req.params.planId,
      userId: req.userId,
    });

    if (!plan) {
      return res.status(404).json({ message: "Workout plan not found" });
    }

    res.json({ message: "Workout plan deleted successfully" });
  } catch (error) {
    console.error("Delete workout error:", error);
    res.status(500).json({ message: "Error deleting workout plan" });
  }
});

export default router;
