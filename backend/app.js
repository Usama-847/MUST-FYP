import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { fileURLToPath } from "url";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import userStatusRoutes from "./routes/userStatusRoutes.js";
import UserMealPlanRoutes from "./routes/UserMealPlanRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";
import exerciseRoutes from "./routes/exerciseRoutes.js";
import progressRoutes from "./routes/ExerciseProgress.js";

// Setup __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 5123;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Enable CORS only in development
if (process.env.NODE_ENV !== "production") {
  app.use(cors({ origin: process.env.FRONTEND_URL }));
}

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/user", userStatusRoutes);
app.use("/api/user", UserMealPlanRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/meals", UserMealPlanRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/progress", progressRoutes);

// === 🛠 Serve React frontend (build folder inside backend root) === //
app.use(express.static(path.join(__dirname, "build")));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Error Handlers
app.use(notFound);
app.use(errorHandler);

// Start Server
app.listen(port, () => console.log(`Server started on port ${port}`));

export default app;
