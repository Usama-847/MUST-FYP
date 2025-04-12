import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";

function Dashboard() {
  const navigate = useNavigate();
  const [savedPlans, setSavedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState({});

  // Get user from Redux store
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!userInfo) {
      navigate("/pages/login");
      return;
    }

    fetchSavedPlans();

    // Load progress data from localStorage
    const savedProgress = localStorage.getItem("workout_progress");
    if (savedProgress) {
      setProgressData(JSON.parse(savedProgress));
    }
  }, [userInfo, navigate]);

  const fetchSavedPlans = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/workouts");
      setSavedPlans(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching saved plans:", error);
      toast.error("Failed to load your saved plans");
      setLoading(false);
    }
  };

  const handleViewSavedPlans = () => {
    if (!userInfo) {
      toast.info("Please login to view your saved plans");
      return;
    }

    // Navigate to the saved plans page
    navigate("/saved-plans");
  };

  // Get total average completion percentage across all plans
  const getOverallProgress = () => {
    const planIds = Object.keys(progressData);
    if (planIds.length === 0) return 0;

    const totalProgress = planIds.reduce(
      (sum, planId) => sum + progressData[planId],
      0
    );
    return Math.round(totalProgress / planIds.length);
  };

  // Get number of completely finished plans (100% complete)
  const getCompletedPlansCount = () => {
    return Object.values(progressData).filter((progress) => progress === 100)
      .length;
  };

  // Get active plans (started but not completed)
  const getActivePlansCount = () => {
    return Object.values(progressData).filter(
      (progress) => progress > 0 && progress < 100
    ).length;
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <ToastContainer position="top-right" autoClose={5000} />

        {/* Dashboard Header */}
        <header className="bg-white rounded-lg shadow-md p-5 mb-6">
          <h1 className="text-2xl font-bold mb-4">Your Dashboard</h1>
          <p className="text-gray-600 mb-6">
            Welcome back! Manage your workout plans and track your fitness
            progress.
          </p>

          {/* View Saved Plans Button */}
          <button
            onClick={handleViewSavedPlans}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
            View Saved Plans
          </button>
        </header>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow-md p-5 mb-6">
          <h2 className="text-xl font-semibold mb-4">Workout Progress</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Overall Progress */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-blue-800">Overall Progress</h3>
                <span className="text-2xl font-bold text-blue-600">
                  {getOverallProgress()}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${getOverallProgress()}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                Average completion across all plans
              </p>
            </div>

            {/* Completed Plans */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-green-800">Completed Plans</h3>
                <span className="text-2xl font-bold text-green-600">
                  {getCompletedPlansCount()}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Plans you've fully completed
              </p>
            </div>

            {/* Active Plans */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-yellow-800">Active Plans</h3>
                <span className="text-2xl font-bold text-yellow-600">
                  {getActivePlansCount()}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Plans you're currently working on
              </p>
            </div>
          </div>

          {/* Individual Plan Progress */}
          {Object.keys(progressData).length > 0 ? (
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">
                Your Plan Progress
              </h3>
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center items-center h-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  savedPlans.map((plan) => {
                    const progress = progressData[plan._id] || 0;
                    return (
                      <div
                        key={plan._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition duration-300"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">
                              {plan.planName || `${plan.userData?.goal} Plan`}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {plan.planData?.summary || "Custom workout plan"}
                            </p>
                          </div>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {progress}% complete
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-4">
                          <button
                            onClick={() =>
                              navigate(`/workout-plan/${plan._id}`)
                            }
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            View Details
                          </button>
                          <button
                            onClick={() => navigate(`/workout/${plan._id}`)}
                            className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Continue
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="font-medium text-gray-700 mb-2">
                No Progress Yet
              </h3>
              <p className="text-gray-500 mb-4">
                You haven't started any workout plans yet.
              </p>
              <Link
                to="/pages/exercise-planner"
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Create Your First Plan
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-5 mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/pages/exercise-planner"
              className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition duration-300"
            >
              <div className="p-2 bg-blue-100 rounded-full mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Create New Plan</h3>
                <p className="text-sm text-gray-600">
                  Build a custom workout plan
                </p>
              </div>
            </Link>

            <Link
              to="/components/ExerciseDB"
              className="flex items-center p-4 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 transition duration-300"
            >
              <div className="p-2 bg-purple-100 rounded-full mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Workout Library</h3>
                <p className="text-sm text-gray-600">
                  Browse pre-made workouts
                </p>
              </div>
            </Link>

            <Link
              to="/fitness-tracker"
              className="flex items-center p-4 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition duration-300"
            >
              <div className="p-2 bg-green-100 rounded-full mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Fitness Tracker</h3>
                <p className="text-sm text-gray-600">
                  Record your stats and progress
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Fitness Tips */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <h2 className="text-xl font-semibold mb-4">Fitness Tip of the Day</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              Stay Hydrated
            </h3>
            <p className="text-gray-700">
              Drinking water before, during, and after your workout helps
              maintain your energy levels and improves performance. Aim for at
              least 16-20 ounces of water two hours before exercise, and 8
              ounces every 15-20 minutes during your workout.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
