import path from "path";
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";
const port = process.env.PORT || 5123;
import userRoutes from "./routes/userRoutes.js";
import userStatusRoutes from "./routes/userStatusRoutes.js";
import UserMealPlanRoutes from "./routes/UserMealPlanRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";
import exerciseRoutes from "./routes/exerciseRoutes.js";
import progressRoutes from "./routes/ExerciseProgress.js";
import cors from "cors";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// In production, we don't need CORS since frontend and backend are served from the same origin
if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
    })
  );
}

app.use("/api/users", userRoutes);
app.use("/api/user", userStatusRoutes);
app.use("/api/user", UserMealPlanRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/meals", UserMealPlanRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/progress", progressRoutes);

// Serve static files from the React build folder
// For a typical setup where you move the build folder to the backend root
app.use(express.static(path.join(__dirname, "build")));

// For any request that doesn't match one above, send back the index.html file
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));

export default app;
