import express from "express";
import Exercise from "../models/exerciseModel.js";

const router = express.Router();

// Get all exercises
router.get("/", async (req, res) => {
  try {
    const exercises = await Exercise.find({});
    console.log("All exercises:", exercises);
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
    console.log(`Searching for exercises with muscle group: "${muscleTrimmed}"`);

    if (!muscleTrimmed) {
      return res.status(400).json({ error: "Muscle parameter is required" });
    }

    // Log all muscle groups in the database
    const allMuscleGroups = await Exercise.find({}, { muscleGroup: 1 });
    console.log("Available muscle groups:", allMuscleGroups);

    // Try a more flexible query
    const exerciseDoc = await Exercise.findOne({ 
      muscleGroup: { $regex: muscleTrimmed, $options: "i" }
    });

    console.log(`Found exercise document for "${muscleTrimmed}":`, exerciseDoc);

    if (!exerciseDoc) {
      return res.status(404).json({ message: "No exercises found for this muscle group" });
    }

    return res.status(200).json(exerciseDoc);
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