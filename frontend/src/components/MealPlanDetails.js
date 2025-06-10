import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import Header from "../components/Header";
import ThinkingAnimation from "../components/ThinkingAnimation";

const MealPlanDetails = () => {
  const { mealId } = useParams();
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get user from Redux store
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    // Redirect if not logged in
    if (!userInfo) {
      navigate("/pages/login");
      return;
    }

    fetchMealPlan();
  }, [userInfo, navigate, mealId]);

  const fetchMealPlan = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/meals/${mealId}`);
      setMealPlan(response.data);
    } catch (error) {
      console.error("Error fetching meal plan:", error);
      toast.error("Failed to load meal plan details");
      // Redirect back to saved plans if meal not found
      setTimeout(() => navigate("/saved-plans"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Meal Plan Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The meal plan you're looking for doesn't exist or has been
              removed.
            </p>
            <Link
              to="/saved-plans"
              className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Back to Saved Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Safe access to meal plan data (same as MealUserModal)
  const safeUserData = mealPlan.userData || {
    fitnessGoal: "Not specified",
    dietaryPreference: "Not specified",
    mealsPerDay: "3",
    weight: "N/A",
    allergies: "None",
  };

  const safeMealPlan = mealPlan.planData || {
    summary: "No summary available",
    meals: [],
    nutritionSummary: {
      calories: "N/A",
      protein: "N/A",
      carbs: "N/A",
      fat: "N/A",
    },
    tips: [],
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <ToastContainer position="top-right" autoClose={5000} />

      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-teal-500 text-white py-6 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                {mealPlan.planName || "Meal Plan Details"}
              </h1>
              <p className="text-base md:text-lg opacity-90">
                {safeMealPlan.summary || "Your personalized meal plan"}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                {safeUserData.dietaryPreference || "Custom"}
              </span>
              <span className="text-sm opacity-75">
                Created: {formatDate(mealPlan.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <Link
          to="/saved-plans"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Saved Plans
        </Link>
      </div>

      {/* Meal Plan Content */}
      <div className="container mx-auto px-4 pb-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Plan Summary - Same as MealUserModal */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Plan Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="mb-2">
                  <strong>Fitness Goal:</strong> {safeUserData.fitnessGoal}
                </p>
                <p className="mb-2">
                  <strong>Dietary Preference:</strong>{" "}
                  {safeUserData.dietaryPreference}
                </p>
                <p className="mb-2">
                  <strong>Meals Per Day:</strong> {safeUserData.mealsPerDay}
                </p>
              </div>
              <div>
                <p className="mb-2">
                  <strong>Weight:</strong> {safeUserData.weight} kg
                </p>
                {safeUserData.allergies && (
                  <p className="mb-2">
                    <strong>Allergies:</strong> {safeUserData.allergies}
                  </p>
                )}
                <p className="mb-2">
                  <strong>Created:</strong> {formatDate(mealPlan.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Nutrition Summary */}
          {safeMealPlan.nutritionSummary && (
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Nutrition Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {safeMealPlan.nutritionSummary.calories}
                  </div>
                  <div className="text-sm text-gray-600">Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {safeMealPlan.nutritionSummary.protein}
                  </div>
                  <div className="text-sm text-gray-600">Protein (g)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {safeMealPlan.nutritionSummary.carbs}
                  </div>
                  <div className="text-sm text-gray-600">Carbs (g)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {safeMealPlan.nutritionSummary.fat}
                  </div>
                  <div className="text-sm text-gray-600">Fat (g)</div>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Meal Plan - Same structure as MealUserModal */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Detailed Meal Plan</h2>
            {safeMealPlan.meals && safeMealPlan.meals.length > 0 ? (
              <div className="space-y-6">
                {safeMealPlan.meals.map((meal, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 bg-white shadow-sm"
                  >
                    <h3 className="text-lg font-semibold mb-3 bg-gray-100 p-3 rounded">
                      {meal.name || `Meal ${index + 1}`}
                    </h3>
                    {meal.foods && meal.foods.length > 0 ? (
                      <ul className="space-y-2">
                        {meal.foods.map((food, idx) => (
                          <li
                            key={idx}
                            className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                          >
                            <div>
                              <strong className="text-gray-800">
                                {food.name}
                              </strong>
                              {food.amount && (
                                <span className="text-gray-600 ml-2">
                                  ({food.amount})
                                </span>
                              )}
                            </div>
                            {food.calories && (
                              <span className="text-sm text-blue-600 font-medium">
                                {food.calories} cal
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">
                        No foods specified for this meal
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No detailed meal information available</p>
              </div>
            )}
          </div>

          {/* Tips Section */}
          {safeMealPlan.tips && safeMealPlan.tips.length > 0 && (
            <div className="mb-8 p-4 bg-green-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Tips & Suggestions</h2>
              <ul className="space-y-2">
                {safeMealPlan.tips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealPlanDetails;
