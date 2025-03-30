import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import UserForm from "../components/UserForm";
import WorkoutPlan from "../components/WorkoutPlans";
import Tips from "../components/Tips";
import ThinkingAnimation from "../components/ThinkingAnimation";
import Header from "../components/Header";
import UserModal from "../components/UserModal";

const ExercisePlanner = () => {
  const [userData, setUserData] = useState({
    weight: "",
    height: "",
    goal: "",
    fitnessLevel: "",
    selectedDays: [], // New state for selected days
    limitations: "",
  });

  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Get user from Redux store
  const { userInfo } = useSelector((state) => state.auth);

  // Add ref for the results section
  const resultsRef = useRef(null);

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

  // New function to handle day selection
  const handleDaySelect = (day, isSelected) => {
    if (isSelected) {
      setUserData({
        ...userData,
        selectedDays: [...userData.selectedDays, day],
      });
    } else {
      setUserData({
        ...userData,
        selectedDays: userData.selectedDays.filter((d) => d !== day),
      });
    }
  };

  const generateWorkoutPlan = async () => {
    // Validate inputs
    if (
      !userData.weight ||
      !userData.height ||
      !userData.goal ||
      !userData.fitnessLevel ||
      userData.selectedDays.length === 0 // Check if any days are selected
    ) {
      toast.error(
        "Please fill all required fields and select at least one day"
      );
      return;
    }

    // Start thinking phase and API call
    setIsThinking(true);
    setIsGenerating(true);

    // Sort days according to natural week order
    const weekOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const sortedSelectedDays = userData.selectedDays.sort(
      (a, b) => weekOrder.indexOf(a) - weekOrder.indexOf(b)
    );

    // Create payload with sorted selected days
    const payload = {
      ...userData,
      daysPerWeek: userData.selectedDays.length,
      selectedDays: sortedSelectedDays,
    };

    const apiPromise = axios.post("/api/workouts/generate", payload);
    const timerPromise = new Promise((resolve) => setTimeout(resolve, 5000));

    try {
      const [response] = await Promise.all([apiPromise, timerPromise]);

      // Ensure the response data has the expected structure
      const planData = response.data;

      // Create a default structure if any part is missing
      const sanitizedPlan = {
        summary:
          planData.summary ||
          `${userData.selectedDays.length} day ${userData.goal} plan`,
        workoutDays: Array.isArray(planData.workoutDays)
          ? planData.workoutDays
          : [],
        tips: Array.isArray(planData.tips) ? planData.tips : [],
      };

      // If workoutDays is empty, create placeholder days
      if (sanitizedPlan.workoutDays.length === 0) {
        for (let i = 0; i < userData.selectedDays.length; i++) {
          sanitizedPlan.workoutDays.push({
            day: userData.selectedDays[i],
            focus: "General Workout",
            exercises: [],
          });
        }
      }

      setWorkoutPlan(sanitizedPlan);
      setIsThinking(false);
      setIsRevealing(true);
      setIsGenerating(false);

      toast.success("Workout plan generated successfully!");
    } catch (error) {
      console.error("Error generating workout plan:", error);
      toast.error("Failed to generate workout plan. Please try again.");
      setIsThinking(false);
      setIsGenerating(false);
    }
  };

  const handleSaveClick = () => {
    if (!userInfo) {
      toast.info("Please login to save your workout plan");
      return;
    }

    if (!workoutPlan) {
      toast.error("No workout plan to save");
      return;
    }

    setShowModal(true);
  };

  const handleViewSavedPlans = () => {
    if (!userInfo) {
      toast.info("Please login to view your saved plans");
      return;
    }

    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handlePlanSaved = (savedPlan) => {
    // You can update the current workout plan with the saved version if needed
    if (savedPlan && savedPlan.planData) {
      setWorkoutPlan(savedPlan.planData);
    }
  };

  return (
    <div className="bg-gray-50">
      <Header />
      <ToastContainer position="top-right" autoClose={5000} />

      {/* Thinking Animation Overlay */}
      {isThinking && <ThinkingAnimation />}

      {/* User Modal for Saving and Viewing Plans */}
      <UserModal
        show={showModal}
        handleClose={handleModalClose}
        workoutPlan={workoutPlan}
        userData={userData}
        onSave={handlePlanSaved}
      />

      {/* Header - Reduced padding */}
      <header className="bg-gradient-to-r from-blue-600 to-teal-500 text-white py-6 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            AI Exercise Planner
          </h1>
          <p className="text-base md:text-lg opacity-90">
            Customized workout plans powered by Google's Gemini AI
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* User Input Form - Made more compact */}
        <div className="bg-white rounded-lg shadow-md p-5 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-0">
              Create Your Personalized Workout Plan
            </h2>
            {userInfo && (
              <button
                onClick={handleViewSavedPlans}
                className="px-4 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
              >
                View Your Saved Plans
              </button>
            )}
          </div>
          <UserForm
            userData={userData}
            handleInputChange={handleInputChange}
            generateWorkoutPlan={generateWorkoutPlan}
            isGenerating={isGenerating}
            handleDaySelect={handleDaySelect}
          />
        </div>

        {/* Results Section - With ref for scrolling */}
        {workoutPlan && !isThinking && (
          <div ref={resultsRef}>
            <div className="bg-white rounded-lg shadow-md p-5 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-0">
                  Your AI-Generated Workout Plan
                </h2>
                <button
                  onClick={handleSaveClick}
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
                AI-Recommended Tips For Success
              </h2>
              <Tips tips={workoutPlan.tips || []} />
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
            © 2025 AI Exercise Planner. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ExercisePlanner;
