import express from "express";
import Exercise from "../models/exerciseModel.js";

const router = express.Router();

// Get all exercises
router.get("/", async (req, res) => {
  try {
    const exercises = await Exercise.find({});
    res.status(200).json(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    res.status(500).json({ error: "Failed to fetch exercises" });
  }
});

// Get exercises by muscle group
router.get("/muscle/:muscle", async (req, res) => {
  try {
    const { muscle } = req.params;
    const muscleTrimmed = muscle.trim(); // Trim any whitespace

    if (!muscleTrimmed) {
      return res.status(400).json({ error: "Muscle parameter is required" });
    }

    // Find the exercise document for the specified muscle group
    const exerciseDoc = await Exercise.findOne({
      muscleGroup: { $regex: new RegExp(`^${muscleTrimmed}$`, "i") },
    });

    if (!exerciseDoc) {
      return res
        .status(404)
        .json({ message: "No exercises found for this muscle group" });
    }

    // Return the exercises array directly as expected by frontend
    return res.status(200).json({ exercises: exerciseDoc.exercises });
  } catch (error) {
    console.error("Error fetching exercises by muscle:", error);
    res.status(500).json({ error: "Failed to fetch exercises by muscle" });
  }
});

// Get single exercise by ID
router.get("/:id", async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    res.status(200).json(exercise);
  } catch (error) {
    console.error("Error fetching exercise:", error);
    res.status(500).json({ error: "Failed to fetch exercise" });
  }
});

export default router;
