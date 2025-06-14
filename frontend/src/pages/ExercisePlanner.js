import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
    selectedDays: [],
    limitations: "",
  });

  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { userInfo } = useSelector((state) => state.auth);

  const resultsRef = useRef(null);

  useEffect(() => {
    if (location.state?.loadedPlan && location.state?.loadedUserData) {
      setWorkoutPlan(location.state.loadedPlan);
      setUserData(location.state.loadedUserData);
      setIsRevealing(true);
      toast.success("Exercise plan loaded successfully!");

      // Clear the state to prevent reloading on subsequent renders
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

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
        planType: "Exercise Plan", // Add plan type identifier
        planName: `${userData.selectedDays.length}-Day ${userData.goal
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())} ${
          userData.fitnessLevel.charAt(0).toUpperCase() +
          userData.fitnessLevel.slice(1)
        } Plan`,
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

    // Navigate to the SavedPlansPage with workout tab active and filter for Exercise Plans only
    navigate("/saved-plans?tab=workout&planType=Exercise Plan");
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

  const handleReset = () => {
    setUserData({
      weight: "",
      height: "",
      goal: "",
      fitnessLevel: "",
      selectedDays: [],
      limitations: "",
    });
    setWorkoutPlan(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
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
        planTypeFilter="Exercise Plan" // Pass the plan type filter
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Main Form Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-blue-500 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-2">AI Exercise Planner</h1>
                <p className="text-blue-100">Generate personalized workout plans based on your goals</p>
              </div>
              {userInfo && (
                <button
                  onClick={handleViewSavedPlans}
                  className="bg-white text-blue-500 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition duration-300"
                >
                  View Your Saved Plans
                </button>
              )}
            </div>
          </div>

          {/* Form Section */}
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="weight"
                  value={userData.weight}
                  onChange={handleInputChange}
                  placeholder="Enter your weight"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="height"
                  value={userData.height}
                  onChange={handleInputChange}
                  placeholder="Enter your height"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Fitness Goal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fitness Goal <span className="text-red-500">*</span>
                </label>
                <select
                  name="goal"
                  value={userData.goal}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Select goal</option>
                  <option value="weightLoss">Weight Loss</option>
                  <option value="muscleGain">Muscle Gain</option>
                  <option value="endurance">Endurance</option>
                  <option value="strength">Strength</option>
                  <option value="generalFitness">General Fitness</option>
                </select>
              </div>

              {/* Fitness Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fitness Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="fitnessLevel"
                  value={userData.fitnessLevel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Select level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Workout Days */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workout Days <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <label key={day} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userData.selectedDays.includes(day)}
                      onChange={(e) => handleDaySelect(day, e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-full px-2 py-1.5 text-xs font-medium rounded-md border-2 text-center transition-all ${
                      userData.selectedDays.includes(day)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                    }`}>
                      {day.slice(0, 3)}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Limitations */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Limitations (optional)
              </label>
              <textarea
                name="limitations"
                value={userData.limitations}
                onChange={handleInputChange}
                placeholder="e.g., knee injury, back problems"
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Buttons */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={generateWorkoutPlan}
                disabled={isGenerating}
                className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
              >
                {isGenerating ? "Generating..." : "Generate Workout Plan"}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition duration-300"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Results Section - With ref for scrolling */}
        {workoutPlan && !isThinking && (
          <div ref={resultsRef} className="mt-8">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <div className="mb-3 md:mb-0">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                    {workoutPlan.planType}: {workoutPlan.planName}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Your AI-Generated Workout Plan
                  </p>
                </div>
                <button
                  onClick={handleSaveClick}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition duration-300"
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
              <h2 className="text-lg md:text-xl font-semibold text-teal-600 mb-3">
                AI-Recommended Tips For Success
              </h2>
              <Tips tips={workoutPlan.tips || []} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExercisePlanner;