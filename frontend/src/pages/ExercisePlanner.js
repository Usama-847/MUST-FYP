import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserForm from "../components/UserForm";
import WorkoutPlan from "../components/WorkoutPlans";
import Tips from "../components/Tips";
import ThinkingAnimation from "../components/ThinkingAnimation";
import Header from "../components/Header";

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
  const [isGenerating, setIsGenerating] = useState(false);

  // Add ref for the results section
  const resultsRef = useRef(null);

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

  // Add effect to scroll to results when workout plan is generated
  useEffect(() => {
    if (workoutPlan && !isThinking && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [workoutPlan, isThinking]);

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
    setIsGenerating(true);
    const apiPromise = axios.post("/api/workouts/generate", userData);
    const timerPromise = new Promise((resolve) => setTimeout(resolve, 5000));

    try {
      const [response] = await Promise.all([apiPromise, timerPromise]);
      setWorkoutPlan(response.data);
      setIsThinking(false);
      setIsRevealing(true);
      setIsGenerating(false);

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
      setIsGenerating(false);
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
    <div className="bg-gray-50">
      <Header />
      <ToastContainer position="top-right" autoClose={5000} />

      {/* Thinking Animation Overlay */}
      {isThinking && <ThinkingAnimation />}

      {/* Header - Reduced padding */}
      <header className="bg-gradient-to-r from-blue-600 to-teal-500 text-white py-6 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            Exercise Planner
          </h1>
          <p className="text-base md:text-lg opacity-90">
            Customized workout plans tailored to your specific weight and
            fitness goals
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* User Input Form - Made more compact */}
        <div className="bg-white rounded-lg shadow-md p-5 mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
            Create Your Personalized Workout Plan
          </h2>
          <UserForm
            userData={userData}
            handleInputChange={handleInputChange}
            generateWorkoutPlan={generateWorkoutPlan}
            isGenerating={isGenerating}
          />
        </div>

        {/* Results Section - With ref for scrolling */}
        {workoutPlan && !isThinking && (
          <div ref={resultsRef}>
            <div className="bg-white rounded-lg shadow-md p-5 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-0">
                  Your Personalized Workout Plan
                </h2>
                <button
                  onClick={saveWorkoutPlan}
                  className="px-4 py-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition duration-300"
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

            <div className="bg-teal-50 border-l-4 border-teal-500 rounded-lg shadow-md p-5">
              <h2 className="text-lg md:text-xl font-semibold text-teal-600 mb-3">
                Tips For Success
              </h2>
              <Tips goal={userData.goal} fitnessLevel={userData.fitnessLevel} />
            </div>
          </div>
        )}
      </div>

      <footer className="mt-8 py-4 bg-gray-100 text-center text-gray-600">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-xs md:text-sm">
            Always consult with a healthcare professional before starting any
            new exercise program.
          </p>
          <p className="text-xs md:text-sm">
            © 2025 Exercise Planner. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ExercisePlanner;
