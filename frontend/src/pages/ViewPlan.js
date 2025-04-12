import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import Header from "../components/Header";

const ViewPlan = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedExercises, setCompletedExercises] = useState({});
  const [skippedExercises, setSkippedExercises] = useState({});
  const [currentDay, setCurrentDay] = useState("");
  const { planId } = useParams();
  const navigate = useNavigate();

  // Get user from Redux store
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    // Redirect if not logged in
    if (!userInfo) {
      navigate("/pages/login");
      return;
    }

    // Set current day of the week
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = new Date().getDay();
    setCurrentDay(days[today]);

    fetchPlanDetails();
    // Load completed exercises from localStorage
    const savedCompletedExercises = localStorage.getItem(`completed_${planId}`);
    const savedSkippedExercises = localStorage.getItem(`skipped_${planId}`);

    if (savedCompletedExercises) {
      setCompletedExercises(JSON.parse(savedCompletedExercises));
    }

    if (savedSkippedExercises) {
      setSkippedExercises(JSON.parse(savedSkippedExercises));
    }
  }, [userInfo, planId, navigate]);

  const fetchPlanDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/workouts/${planId}`);
      setPlan(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching plan details:", error);
      toast.error("Failed to load the workout plan");
      setLoading(false);
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

  // Calculate the total number of exercises in the plan
  const getTotalExercisesCount = () => {
    if (!plan || !plan.planData || !plan.planData.workoutDays) return 0;

    return plan.planData.workoutDays.reduce((total, day) => {
      return total + day.exercises.length;
    }, 0);
  };

  // Calculate completion percentage for the plan
  const calculateCompletionPercentage = () => {
    const totalExercises = getTotalExercisesCount();
    if (totalExercises === 0) return 0;

    const completedCount = Object.keys(completedExercises).length;
    return Math.round((completedCount / totalExercises) * 100);
  };

  // Check if the day is the current day of the week
  const isCurrentDay = (dayName) => {
    return dayName === currentDay;
  };

  // Handle completing an exercise
  const handleCompleteExercise = (dayIndex, exerciseIndex) => {
    const exerciseId = `${dayIndex}-${exerciseIndex}`;

    // If already completed, do nothing
    if (completedExercises[exerciseId]) return;

    const updatedCompleted = { ...completedExercises };
    updatedCompleted[exerciseId] = true;

    setCompletedExercises(updatedCompleted);
    localStorage.setItem(
      `completed_${planId}`,
      JSON.stringify(updatedCompleted)
    );

    // Calculate and save progress to localStorage
    const completionPercentage = calculateCompletionPercentage();
    const progressData = JSON.parse(
      localStorage.getItem("workout_progress") || "{}"
    );
    progressData[planId] = completionPercentage;
    localStorage.setItem("workout_progress", JSON.stringify(progressData));

    toast.success("Exercise completed!");
  };

  // Handle skipping an exercise
  const handleSkipExercise = (dayIndex, exerciseIndex) => {
    const exerciseId = `${dayIndex}-${exerciseIndex}`;

    // If already skipped, do nothing
    if (skippedExercises[exerciseId]) return;

    const updatedSkipped = { ...skippedExercises };
    updatedSkipped[exerciseId] = true;

    setSkippedExercises(updatedSkipped);
    localStorage.setItem(`skipped_${planId}`, JSON.stringify(updatedSkipped));

    // Find the next day with exercises to move this exercise to
    if (plan && plan.planData && plan.planData.workoutDays) {
      toast.info("Exercise skipped and moved to the next available day");
    }

    // Update progress
    const completionPercentage = calculateCompletionPercentage();
    const progressData = JSON.parse(
      localStorage.getItem("workout_progress") || "{}"
    );
    progressData[planId] = completionPercentage;
    localStorage.setItem("workout_progress", JSON.stringify(progressData));
  };

  // Check if an exercise is completed
  const isExerciseCompleted = (dayIndex, exerciseIndex) => {
    return completedExercises[`${dayIndex}-${exerciseIndex}`] || false;
  };

  // Check if an exercise is skipped
  const isExerciseSkipped = (dayIndex, exerciseIndex) => {
    return skippedExercises[`${dayIndex}-${exerciseIndex}`] || false;
  };

  // Calculate progress per day
  const calculateDayProgress = (dayIndex) => {
    if (!plan || !plan.planData || !plan.planData.workoutDays) return 0;

    const day = plan.planData.workoutDays[dayIndex];
    if (!day || day.exercises.length === 0) return 0;

    let completedCount = 0;
    day.exercises.forEach((_, exerciseIndex) => {
      if (isExerciseCompleted(dayIndex, exerciseIndex)) {
        completedCount++;
      }
    });

    return Math.round((completedCount / day.exercises.length) * 100);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <ToastContainer position="top-right" autoClose={5000} />

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-teal-500 text-white py-6 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            Workout Plan Details
          </h1>
          <p className="text-base md:text-lg opacity-90">
            View your complete workout plan
          </p>
          <p className="text-base mt-2 bg-white bg-opacity-20 inline-block px-3 py-1 rounded">
            Today is {currentDay}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <Link
            to="/saved-plans"
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
            Back to Saved Plans
          </Link>

          <Link
            to="/pages/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            View Dashboard
            <svg
              className="w-5 h-5 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : plan ? (
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
            {/* Plan Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center">
                    <h2 className="text-2xl font-bold">
                      {plan.planName || `${plan.userData?.goal} Plan`}
                    </h2>
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
                <div className="text-sm text-gray-500">
                  Created: {formatDate(plan.createdAt)}
                </div>
              </div>

              {/* Overall Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Overall Progress
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {calculateCompletionPercentage()}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${calculateCompletionPercentage()}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                <div className="bg-gray-100 px-3 py-1 rounded-full">
                  Goal:{" "}
                  <span className="font-medium">
                    {plan.userData?.goal || "Custom"}
                  </span>
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded-full">
                  <span className="font-medium">
                    {plan.userData?.selectedDays?.length || "N/A"} days
                  </span>{" "}
                  per week
                </div>
                {plan.userData?.weight && (
                  <div className="bg-gray-100 px-3 py-1 rounded-full">
                    Weight:{" "}
                    <span className="font-medium">{plan.userData.weight}</span>
                  </div>
                )}
                {plan.userData?.height && (
                  <div className="bg-gray-100 px-3 py-1 rounded-full">
                    Height:{" "}
                    <span className="font-medium">{plan.userData.height}</span>
                  </div>
                )}
              </div>

              {plan.userData?.limitations && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm">
                  <div className="font-semibold">
                    Limitations/Considerations:
                  </div>
                  <div>{plan.userData.limitations}</div>
                </div>
              )}
            </div>

            {/* Workout Days */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-xl font-semibold mb-4">Workout Schedule</h3>

              <div className="grid grid-cols-1 gap-6">
                {plan.planData?.workoutDays?.map((day, dayIndex) => {
                  const isDayToday = isCurrentDay(day.day);
                  
                  return (
                  <div
                    key={dayIndex}
                    className={`border ${
                      isDayToday 
                        ? "border-blue-300 shadow-md" 
                        : "border-gray-200"
                    } rounded-lg overflow-hidden`}
                  >
                    <div className={`${
                      isDayToday 
                        ? "bg-blue-50" 
                        : "bg-gray-50"
                    } px-4 py-3 border-b border-gray-200`}>
                      <div className="flex justify-between items-center">
                        <h4 className={`text-lg font-semibold ${
                          isDayToday ? "text-blue-700" : ""
                        }`}>
                          {day.day}
                          {isDayToday && (
                            <span className="ml-2 bg-blue-500 text-white px-2 py-0.5 text-xs rounded-full">
                              Today
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center gap-3">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {day.focus}
                          </span>
                          {day.exercises.length > 0 && (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              {calculateDayProgress(dayIndex)}% Complete
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {day.exercises.length > 0 ? (
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {day.exercises.map((exercise, exIndex) => {
                            const isCompleted = isExerciseCompleted(
                              dayIndex,
                              exIndex
                            );
                            const isSkipped = isExerciseSkipped(
                              dayIndex,
                              exIndex
                            );

                            return (
                              <div
                                key={exIndex}
                                className={`${
                                  isCompleted
                                    ? "bg-green-50 border-green-200"
                                    : isSkipped
                                    ? "bg-gray-50 border-gray-200 opacity-70"
                                    : "bg-white border-gray-200"
                                } border rounded-md p-3 hover:shadow-sm transition-shadow`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h5
                                    className={`font-semibold ${
                                      isCompleted
                                        ? "text-green-800"
                                        : "text-gray-800"
                                    } mb-2`}
                                  >
                                    {exercise.name}
                                    {isSkipped && (
                                      <span className="text-xs text-gray-500 ml-2">
                                        (Skipped)
                                      </span>
                                    )}
                                  </h5>

                                  {/* Status indicators */}
                                  {isCompleted && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <svg
                                        className="w-3 h-3 mr-1"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        ></path>
                                      </svg>
                                      Completed
                                    </span>
                                  )}
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  <div className="bg-gray-50 p-2 rounded text-center">
                                    <div className="text-gray-500">Sets</div>
                                    <div className="font-medium">
                                      {exercise.sets}
                                    </div>
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded text-center">
                                    <div className="text-gray-500">Reps</div>
                                    <div className="font-medium">
                                      {exercise.reps}
                                    </div>
                                  </div>
                                  {exercise.weight && (
                                    <div className="bg-gray-50 p-2 rounded text-center">
                                      <div className="text-gray-500">
                                        Weight
                                      </div>
                                      <div className="font-medium">
                                        {exercise.weight}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {exercise.notes && (
                                  <div className="mt-2 text-sm text-gray-600">
                                    <span className="font-medium">Notes:</span>{" "}
                                    {exercise.notes}
                                  </div>
                                )}

                                {/* Action buttons - Only shown for current day */}
                                {!isCompleted && !isSkipped && isDayToday && (
                                  <div className="mt-3 flex gap-2">
                                    <button
                                      onClick={() =>
                                        handleCompleteExercise(
                                          dayIndex,
                                          exIndex
                                        )
                                      }
                                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition duration-300 flex items-center"
                                    >
                                      <svg
                                        className="w-4 h-4 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M5 13l4 4L19 7"
                                        ></path>
                                      </svg>
                                      Complete
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleSkipExercise(dayIndex, exIndex)
                                      }
                                      className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition duration-300 flex items-center"
                                    >
                                      <svg
                                        className="w-4 h-4 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M13 5l7 7-7 7M5 5l7 7-7 7"
                                        ></path>
                                      </svg>
                                      Skip
                                    </button>
                                  </div>
                                )}
                                
                                {/* Message for non-current days */}
                                {!isCompleted && !isSkipped && !isDayToday && (
                                  <div className="mt-3 text-xs text-gray-500 italic">
                                    Exercise tracking available only on {day.day}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        Rest day - No exercises scheduled
                      </div>
                    )}
                  </div>
                )})}
              </div>
            </div>

            {/* Tips Section */}
            {plan.planData?.tips && plan.planData.tips.length > 0 && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-xl font-semibold mb-4">Training Tips</h3>
                <div className="bg-teal-50 rounded-lg p-4">
                  <ul className="space-y-3">
                    {plan.planData.tips.map((tip, index) => (
                      <li key={index} className="flex">
                        <div className="text-teal-500 mr-2">
                          <svg
                            className="w-5 h-5"
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
                        </div>
                        <div>{tip}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl mb-4">Plan not found</h3>
            <p className="mb-6 text-gray-600">
              The workout plan you're looking for doesn't exist or you may not
              have access to it.
            </p>
            <Link to="/saved-plans">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300">
                Go to Saved Plans
              </button>
            </Link>
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

export default ViewPlan;