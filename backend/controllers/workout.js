// controllers/workoutController.js
import asyncHandler from "express-async-handler";
import Workout from "../models/WorkoutPlan.js";
import User from "../models/userModel.js";

// @desc    Generate a workout plan
// @route   POST /api/workouts/generate
// @access  Public
const generateWorkoutPlan = asyncHandler(async (req, res) => {
  const { weight, goal, fitnessLevel, daysPerWeek, limitations } = req.body;

  // This is where you'd integrate with your workout generation logic
  // For now, let's assume that logic exists elsewhere and returns a plan

  // Sample response structure
  const workoutPlan = {
    summary: `${daysPerWeek} day workout plan for ${goal} with ${fitnessLevel} fitness level`,
    workoutDays: [],
  };

  // Generate workout days based on the daysPerWeek input
  const dayNames = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const selectedDays = dayNames.slice(0, parseInt(daysPerWeek));

  // Generate exercises based on the goal and fitness level
  for (let i = 0; i < selectedDays.length; i++) {
    const day = {
      day: selectedDays[i],
      focus: "",
      exercises: [],
    };

    // Logic to populate the day's exercises would go here
    // This is just placeholder data
    if (goal === "Strength" || goal === "Muscle Building") {
      switch (i % 3) {
        case 0:
          day.focus = "Upper Body";
          day.exercises = [
            {
              name: "Bench Press",
              sets: 4,
              reps: "8-10",
              weight: "based on fitness level",
            },
            {
              name: "Shoulder Press",
              sets: 3,
              reps: "10-12",
              weight: "moderate",
            },
            {
              name: "Lat Pulldown",
              sets: 3,
              reps: "10-12",
              weight: "moderate",
            },
            {
              name: "Bicep Curls",
              sets: 3,
              reps: "12-15",
              weight: "light to moderate",
            },
          ];
          break;
        case 1:
          day.focus = "Lower Body";
          day.exercises = [
            {
              name: "Squats",
              sets: 4,
              reps: "8-10",
              weight: "based on fitness level",
            },
            { name: "Leg Press", sets: 3, reps: "10-12", weight: "heavy" },
            { name: "Leg Curls", sets: 3, reps: "12-15", weight: "moderate" },
            { name: "Calf Raises", sets: 3, reps: "15-20", weight: "moderate" },
          ];
          break;
        case 2:
          day.focus = "Core & Cardio";
          day.exercises = [
            { name: "Plank", sets: 3, reps: "30-60 sec", weight: "bodyweight" },
            { name: "Russian Twists", sets: 3, reps: "15-20", weight: "light" },
            {
              name: "Mountain Climbers",
              sets: 3,
              reps: "20 each leg",
              weight: "bodyweight",
            },
            { name: "HIIT Cardio", sets: 1, reps: "20 min", weight: "n/a" },
          ];
          break;
      }
    } else if (goal === "Weight Loss") {
      // Weight loss focused workout with more cardio
      day.focus = i % 2 === 0 ? "Full Body & Cardio" : "HIIT & Core";
      day.exercises =
        i % 2 === 0
          ? [
              {
                name: "Circuit Training",
                sets: 3,
                reps: "15 reps each",
                weight: "light",
              },
              {
                name: "Jumping Jacks",
                sets: 3,
                reps: "30 sec",
                weight: "bodyweight",
              },
              {
                name: "Bodyweight Squats",
                sets: 3,
                reps: "15-20",
                weight: "bodyweight",
              },
              {
                name: "Steady State Cardio",
                sets: 1,
                reps: "30 min",
                weight: "n/a",
              },
            ]
          : [
              { name: "Burpees", sets: 3, reps: "10-15", weight: "bodyweight" },
              {
                name: "Mountain Climbers",
                sets: 3,
                reps: "30 sec",
                weight: "bodyweight",
              },
              {
                name: "Plank",
                sets: 3,
                reps: "30-60 sec",
                weight: "bodyweight",
              },
              {
                name: "HIIT Intervals",
                sets: 1,
                reps: "20 min",
                weight: "n/a",
              },
            ];
    } else {
      // General fitness plan
      day.focus = [
        "Upper Body",
        "Lower Body",
        "Full Body",
        "Cardio",
        "Core",
        "Rest",
        "Active Recovery",
      ][i];
      day.exercises = [
        { name: "Exercise 1", sets: 3, reps: "10-12", weight: "moderate" },
        { name: "Exercise 2", sets: 3, reps: "10-12", weight: "moderate" },
        { name: "Exercise 3", sets: 3, reps: "10-12", weight: "moderate" },
        { name: "Exercise 4", sets: 3, reps: "10-12", weight: "moderate" },
      ];
    }

    workoutPlan.workoutDays.push(day);
  }

  res.json(workoutPlan);
});

// @desc    Save a workout plan
// @route   POST /api/workouts/save
// @access  Private
const saveWorkoutPlan = asyncHandler(async (req, res) => {
  const { userId, planName, planData, userInputs } = req.body;

  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Create and save the workout plan
  const workoutPlan = new Workout({
    user: userId,
    planName: planName || `Workout Plan - ${new Date().toLocaleDateString()}`,
    planData,
    userInputs,
  });

  const savedPlan = await workoutPlan.save();
  res.status(201).json(savedPlan);
});

// @desc    Get all saved workout plans for a user
// @route   GET /api/workouts/saved
// @access  Private
const getSavedWorkouts = asyncHandler(async (req, res) => {
  const workouts = await Workout.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  res.json(workouts);
});

// @desc    Get a specific workout plan
// @route   GET /api/workouts/:id
// @access  Private
const getWorkoutById = asyncHandler(async (req, res) => {
  const workout = await Workout.findById(req.params.id);

  if (workout && workout.user.toString() === req.user._id.toString()) {
    res.json(workout);
  } else {
    res.status(404);
    throw new Error("Workout plan not found");
  }
});

// @desc    Mark a workout plan as favorite
// @route   POST /api/workouts/favorite
// @access  Private
const favoriteWorkout = asyncHandler(async (req, res) => {
  const { planId } = req.body;

  const workout = await Workout.findById(planId);

  if (!workout) {
    res.status(404);
    throw new Error("Workout plan not found");
  }

  if (workout.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized");
  }

  workout.isFavorite = !workout.isFavorite;
  const updatedWorkout = await workout.save();

  res.json(updatedWorkout);
});

// @desc    Delete a workout plan
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findById(req.params.id);

  if (workout && workout.user.toString() === req.user._id.toString()) {
    await workout.deleteOne(); // Changed from remove() to deleteOne()
    res.json({ message: "Workout plan removed" });
  } else {
    res.status(404);
    throw new Error("Workout plan not found");
  }
});

export {
  generateWorkoutPlan,
  saveWorkoutPlan,
  getSavedWorkouts,
  getWorkoutById,
  favoriteWorkout,
  deleteWorkout,
};
