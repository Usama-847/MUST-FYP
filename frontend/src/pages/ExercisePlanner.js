// Exercise Planner - Main Component
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import UserForm from "../components/UserForm";
import WorkoutPlan from "../components/WorkoutPlans";
import Tips from "../components/Tips";
import LoadingSpinner from "../components/LoadingSpinner";

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

    setLoading(true);

    try {
      // Call backend API to generate workout plan
      const response = await axios.post("/api/workouts/generate", userData);
      setWorkoutPlan(response.data);

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
    } finally {
      setLoading(false);
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
          <h1 className="text-4xl font-bold mb-2">Exercise Planner</h1>
          <p className="text-xl opacity-90">
            Customized workout plans tailored to your specific weight and
            fitness goals
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* User Input Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">
            Create Your Personalized Workout Plan
          </h2>

          <UserForm
            userData={userData}
            handleInputChange={handleInputChange}
            generateWorkoutPlan={generateWorkoutPlan}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center my-8">
            <LoadingSpinner />
          </div>
        )}

        {/* Results Section */}
        {workoutPlan && !loading && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">
                  Your Personalized Workout Plan
                </h2>
                <button
                  onClick={saveWorkoutPlan}
                  className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition"
                >
                  Save Plan
                </button>
              </div>

              <WorkoutPlan plan={workoutPlan} userWeight={userData.weight} />
            </div>

            <div className="bg-teal-50 border-l-4 border-teal-500 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Tips For Success</h2>
              <Tips goal={userData.goal} fitnessLevel={userData.fitnessLevel} />
            </div>
          </>
        )}
      </div>

      <footer className="mt-12 py-6 bg-gray-100 text-center text-gray-600">
        <div className="container mx-auto px-4">
          <p className="mb-2">
            Always consult with a healthcare professional before starting any
            new exercise program.
          </p>
          <p>&copy; 2025 Exercise Planner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ExercisePlanner;
