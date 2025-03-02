import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserForm from "../components/UserForm";
import WorkoutPlan from "../components/WorkoutPlans";
import Tips from "../components/Tips";
import LoadingSpinner from "../components/LoadingSpinner";
import ThinkingAnimation from "../components/ThinkingAnimation";

const ExercisePlanner = () => {
  const [userData, setUserData] = useState({
    weight: "",
    goal: "",
    fitnessLevel: "",
    daysPerWeek: "",
    limitations: "",
  });

  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axios.get("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data);
        }
      } catch (error) {
        console.error("Authentication error:", error);
      }
    };

    checkAuth();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const generateWorkoutPlan = async () => {
    // Validate inputs
    if (
      !userData.weight ||
      !userData.goal ||
      !userData.fitnessLevel ||
      !userData.daysPerWeek
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    // Start thinking phase and API call
    setIsThinking(true);
    const apiPromise = axios.post("/api/workouts/generate", userData);
    const timerPromise = new Promise((resolve) => setTimeout(resolve, 5000));

    try {
      const [response] = await Promise.all([apiPromise, timerPromise]);
      setWorkoutPlan(response.data);
      setIsThinking(false);
      setIsRevealing(true);

      // Save to history if user is logged in
      if (user) {
        await axios.post(
          "/api/workouts/save",
          {
            userId: user._id,
            planData: response.data,
            userInputs: userData,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      toast.success("Workout plan generated successfully!");
    } catch (error) {
      console.error("Error generating workout plan:", error);
      toast.error("Failed to generate workout plan. Please try again.");
      setIsThinking(false);
    }
  };

  const saveWorkoutPlan = async () => {
    if (!user) {
      toast.info("Please login to save your workout plan");
      return;
    }

    if (!workoutPlan) {
      toast.error("No workout plan to save");
      return;
    }

    try {
      await axios.post(
        "/api/workouts/favorite",
        {
          userId: user._id,
          planId: workoutPlan._id,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      toast.success("Workout plan saved to favorites!");
    } catch (error) {
      console.error("Error saving workout plan:", error);
      toast.error("Failed to save workout plan");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={5000} />

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-teal-500 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Exercise Planner
          </h1>
          <p className="text-lg md:text-xl opacity-90">
            Customized workout plans tailored to your specific weight and
            fitness goals
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* User Input Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">
            Create Your Personalized Workout Plan
          </h2>
          <UserForm
            userData={userData}
            handleInputChange={handleInputChange}
            generateWorkoutPlan={generateWorkoutPlan}
          />
        </div>

        {/* Thinking Animation */}
        {isThinking && <ThinkingAnimation />}

        {/* Results Section */}
        {workoutPlan && !isThinking && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 md:mb-0">
                  Your Personalized Workout Plan
                </h2>
                <button
                  onClick={saveWorkoutPlan}
                  className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition duration-300"
                >
                  Save Plan
                </button>
              </div>
              <WorkoutPlan
                plan={workoutPlan}
                userWeight={userData.weight}
                isRevealing={isRevealing}
              />
            </div>

            <div className="bg-teal-50 border-l-4 border-teal-500 rounded-lg shadow-md p-6">
              <h2 className="text-xl md:text-2xl font-semibold text-teal-600 mb-4">
                Tips For Success
              </h2>
              <Tips goal={userData.goal} fitnessLevel={userData.fitnessLevel} />
            </div>
          </>
        )}
      </div>

      <footer className="mt-12 py-6 bg-gray-100 text-center text-gray-600">
        <div className="container mx-auto px-4">
          <p className="mb-2 text-sm md:text-base">
            Always consult with a healthcare professional before starting any
            new exercise program.
          </p>
          <p className="text-sm md:text-base">
            © 2025 Exercise Planner. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ExercisePlanner;
