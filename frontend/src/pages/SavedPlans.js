import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import Header from "../components/Header";
import ThinkingAnimation from "../components/ThinkingAnimation";

const SavedPlans = () => {
  const [savedPlans, setSavedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [workoutStatuses, setWorkoutStatuses] = useState({});
  const navigate = useNavigate();

  // Get user from Redux store
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    // Redirect if not logged in
    if (!userInfo) {
      navigate("/pages/login");
      return;
    }

    fetchSavedPlans();
  }, [userInfo, navigate]);

  const fetchSavedPlans = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/workouts/saved");
      const plans = response.data;

      // Initialize workout statuses
      const initialStatuses = {};
      plans.forEach((plan) => {
        if (plan.planData?.workoutDays) {
          const dayStatuses = {};
          plan.planData.workoutDays.forEach((day, index) => {
            // Default status is 'notStarted'
            dayStatuses[index] = plan.progress?.[index] || "notStarted";
          });
          initialStatuses[plan._id] = dayStatuses;
        }
      });

      setWorkoutStatuses(initialStatuses);
      setSavedPlans(plans);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching saved plans:", error);
      toast.error("Failed to load your saved plans");
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      setIsDeleting(true);
      try {
        await axios.delete(`/api/workouts/${planId}`);
        setSavedPlans(savedPlans.filter((plan) => plan._id !== planId));
        toast.success("Plan deleted successfully");
        setIsDeleting(false);
      } catch (error) {
        console.error("Error deleting plan:", error);
        toast.error("Failed to delete plan");
        setIsDeleting(false);
      }
    }
  };

  const handleStartWorkout = async (planId, dayIndex) => {
    try {
      // Update local state first for immediate UI feedback
      setWorkoutStatuses((prev) => ({
        ...prev,
        [planId]: {
          ...prev[planId],
          [dayIndex]: "inProgress",
        },
      }));

      // Then update on the server
      await axios.post(`/api/workouts/${planId}/start`, { dayIndex });
      toast.success("Workout started!");

      // You could navigate to a workout view page here
      // navigate(`/workout/${planId}/${dayIndex}`);
    } catch (error) {
      console.error("Error starting workout:", error);
      toast.error("Failed to start workout");

      // Revert state on error
      setWorkoutStatuses((prev) => ({
        ...prev,
        [planId]: {
          ...prev[planId],
          [dayIndex]: "notStarted",
        },
      }));
    }
  };

  const handleSkipWorkout = async (planId, dayIndex) => {
    try {
      // Update local state first for immediate UI feedback
      setWorkoutStatuses((prev) => ({
        ...prev,
        [planId]: {
          ...prev[planId],
          [dayIndex]: "skipped",
        },
      }));

      // Then update on the server
      await axios.post(`/api/workouts/${planId}/skip`, { dayIndex });
      toast.info("Workout skipped");
    } catch (error) {
      console.error("Error skipping workout:", error);
      toast.error("Failed to skip workout");

      // Revert state on error
      setWorkoutStatuses((prev) => ({
        ...prev,
        [planId]: {
          ...prev[planId],
          [dayIndex]: "notStarted",
        },
      }));
    }
  };

  const handleCompleteWorkout = async (planId, dayIndex) => {
    try {
      // Update local state first for immediate UI feedback
      setWorkoutStatuses((prev) => ({
        ...prev,
        [planId]: {
          ...prev[planId],
          [dayIndex]: "completed",
        },
      }));

      // Then update on the server
      await axios.post(`/api/workouts/${planId}/complete`, { dayIndex });
      toast.success("Great job! Workout completed!");
    } catch (error) {
      console.error("Error completing workout:", error);
      toast.error("Failed to mark workout as complete");

      // Revert state on error
      setWorkoutStatuses((prev) => ({
        ...prev,
        [planId]: {
          ...prev[planId],
          [dayIndex]: "inProgress",
        },
      }));
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getDifficultyColor = (level) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-blue-100 text-blue-800";
      case "advanced":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get button display based on workout status
  const getActionButtons = (planId, dayIndex, status) => {
    switch (status) {
      case "notStarted":
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => handleStartWorkout(planId, dayIndex)}
              className="text-white bg-green-500 px-3 py-1 rounded text-sm hover:bg-green-600 transition"
            >
              Start
            </button>
            <button
              onClick={() => handleSkipWorkout(planId, dayIndex)}
              className="text-gray-600 bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300 transition"
            >
              Skip
            </button>
          </div>
        );
      case "inProgress":
        return (
          <button
            onClick={() => handleCompleteWorkout(planId, dayIndex)}
            className="text-white bg-blue-500 px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
          >
            Complete
          </button>
        );
      case "completed":
        return (
          <div className="flex items-center text-green-600">
            <svg
              className="w-5 h-5 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span>Completed</span>
          </div>
        );
      case "skipped":
        return (
          <div className="flex items-center text-gray-500">
            <svg
              className="w-5 h-5 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span>Skipped</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <ToastContainer position="top-right" autoClose={5000} />

      {/* Thinking Animation for deletion */}
      {isDeleting && <ThinkingAnimation />}

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-teal-500 text-white py-6 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            Your Saved Workout Plans
          </h1>
          <p className="text-base md:text-lg opacity-90">
            View, manage, and continue your fitness journey
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link
              to="/pages/dashboard"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg
                className="w-5 h-5 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                ></path>
              </svg>
              Back to Dashboard
            </Link>
          </div>
          <Link to="/pages/exercise-planner">
            <button className="px-4 py-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition duration-300">
              Create New Plan
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {savedPlans.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h3 className="text-xl mb-4">
                  You don't have any saved plans yet
                </h3>
                <p className="mb-6 text-gray-600">
                  Create your first fitness plan to get started on your journey
                </p>
                <Link to="/pages/exercise-planner">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300">
                    Create Your First Plan
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {savedPlans.map((plan) => (
                  <div
                    key={plan._id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center">
                          <h3 className="text-xl font-semibold">
                            {plan.planName || `${plan.userData?.goal} Plan`}
                          </h3>
                          <span
                            className={`ml-3 px-2 py-1 text-xs rounded-full ${getDifficultyColor(
                              plan.userData?.fitnessLevel
                            )}`}
                          >
                            {plan.userData?.fitnessLevel || "Custom"}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">
                          {plan.planData?.summary || "Custom workout plan"}
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <Link to={`/plan/${plan._id}`}>
                          <button className="text-white bg-blue-500 px-3 py-1 rounded text-sm hover:bg-blue-600 transition">
                            View
                          </button>
                        </Link>
                        <button
                          className="text-white bg-red-500 px-3 py-1 rounded text-sm hover:bg-red-600 transition"
                          onClick={() => handleDeletePlan(plan._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">
                            {plan.userData?.selectedDays?.length || "N/A"} days
                          </span>{" "}
                          per week
                        </div>
                        <div>
                          Goal:{" "}
                          <span className="font-medium">
                            {plan.userData?.goal || "Custom"}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">
                            Created: {formatDate(plan.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Workout Days with Action Buttons */}
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="font-semibold mb-3">Workout Schedule</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plan.planData?.workoutDays?.map((day, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded p-3 flex flex-col"
                          >
                            <div className="flex justify-between mb-2">
                              <span className="font-medium">{day.day}</span>
                              <span className="text-sm text-gray-600">
                                {day.focus}
                              </span>
                            </div>

                            <div className="text-sm text-gray-600 mb-3">
                              {day.exercises.length > 0
                                ? `${day.exercises.length} exercises`
                                : "Rest day"}
                            </div>

                            <div className="mt-auto">
                              {getActionButtons(
                                plan._id,
                                index,
                                workoutStatuses[plan._id]?.[index] ||
                                  "notStarted"
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
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

export default SavedPlans;
