// File: backend/routes/exerciseRoutes.js
import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// @route   POST /api/exercise/generate-plan
// @desc    Generate exercise plan using Gemini AI
// @access  Public
router.post("/generate-plan", async (req, res) => {
  try {
    const { weight, goal } = req.body;

    if (!weight || !goal) {
      return res.status(400).json({ error: "Weight and goal are required" });
    }

    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(
      "AIzaSyBbw656Yl774iF7urn9etTrcdKVvEuhCnE"
    );
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

    // Create prompt for Gemini
    const prompt = `Create a personalized exercise plan for someone weighing ${weight} kg with a fitness goal of ${goal.replace(
      "-",
      " "
    )}. Include a weekly schedule with specific exercises, sets, reps, and rest periods. Also include some diet recommendations. Format the response with HTML for easy display.`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const plan = response.text();

    return res.status(200).json({ plan });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return res.status(500).json({ error: "Failed to generate exercise plan" });
  }
});
router.get("/test", (req, res) => {
  res.json({ message: "Exercise API is working!" });
});

export default router;
