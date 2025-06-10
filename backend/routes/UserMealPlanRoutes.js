import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  generateMealPlan,
  saveMealPlan,
  getSavedMealPlans,
  getMealPlanById,
  getMealPlanByDate,
  deleteMealPlan,
} from "../controllers/UserMealPlanController.js";

const router = express.Router();

// Public routes
router.post("/generate", generateMealPlan);

// Protected routes
router.post("/save", protect, saveMealPlan);
router.get("/saved", protect, getSavedMealPlans);

// IMPORTANT: Put more specific routes before generic ones
router.get("/date/:date", protect, getMealPlanByDate); // Changed from /:date to /date/:date
router.get("/:id", protect, getMealPlanById); // NEW ROUTE - Get meal plan by ID
router.delete("/:id", protect, deleteMealPlan);

export default router;
