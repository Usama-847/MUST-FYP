import express from "express";
const router = express.Router();
import {
  registerUser,
  authUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserSettings,
  updateUserSettings,
  resetUserGoals,
  exportUserData,
  deleteUserAccount,
} from "../controllers/userController.js";
import {
  logWaterIntake,
  updateWaterIntake,
  getUserWaterIntake,
} from "../controllers/userWaterIntakeController.js";
import { protect } from "../middleware/authMiddleware.js";

// Authentication routes
router.post("/", registerUser);
router.post("/auth", authUser);
router.post("/logout", logoutUser);
router.post("/login", authUser);
router.get("/me", protect, getUserProfile);

// Profile routes
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Goals routes - handled through profile updates
router
  .route("/goals")
  .get(protect, getUserProfile)
  .post(protect, updateUserProfile)
  .put(protect, updateUserProfile);

// Settings routes
router
  .route("/settings")
  .get(protect, getUserSettings)
  .put(protect, updateUserSettings);

// Password change route
router.put("/change-password", protect, changePassword);

// Reset goals route
router.delete("/reset-goals", protect, resetUserGoals);

// Export data route
router.get("/export-data", protect, exportUserData);

// Delete account route
router.delete("/delete-account", protect, deleteUserAccount);

export default router;