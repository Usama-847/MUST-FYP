import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const MealPlanViewer = () => {
  const { date } = useParams(); // Get date from URL for single plan
  const [mealPlans, setMealPlans] = useState([]);
  const [singlePlan, setSinglePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch meal plans
  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        setLoading(true);

        if (date) {
          // Fetch single meal plan by date
          const response = await axios.get(`/api/meals/${date}`);
          setSinglePlan(response.data);
        } else {
          // Fetch all meal plans
          const response = await axios.get('/api/meals/saved');
          setMealPlans(response.data);
        }
      } catch (err) {
        console.error("Error fetching meal plans:", err.message);
        if (err.response) {
          console.error("Response status:", err.response.status);
          console.error("Response data:", err.response.data);
          setError(`Failed to load meal plans: ${err.response.data.message || err.response.statusText}`);
        } else if (err.request) {
          console.error("No response received:", err.request);
          setError("Failed to load meal plans: Network error. Please check your connection and ensure the backend server is running.");
        } else {
          console.error("Error setting up request:", err.message);
          setError(`Failed to load meal plans: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMealPlans();
  }, [date]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  const renderMealPlan = (plan) => (
    <div key={plan._id} className="bg-white shadow-md rounded-lg p-6 mb-4">
      <h2 className="text-2xl font-semibold mb-2">{plan.planName}</h2>
      <p className="text-gray-600 mb-4">Date: {plan.date}</p>
      <div className="mb-4">
        <h3 className="text-xl font-medium mb-2">Summary</h3>
        <p>{plan.planData.summary || 'No summary available'}</p>
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-medium mb-2">Nutrition Summary</h3>
        {plan.planData.nutritionSummary ? (
          <ul className="list-disc pl-5">
            <li>Calories: {plan.planData.nutritionSummary.calories}</li>
            <li>Protein: {plan.planData.nutritionSummary.protein}</li>
            <li>Carbs: {plan.planData.nutritionSummary.carbs}</li>
            <li>Fat: {plan.planData.nutritionSummary.fat}</li>
          </ul>
        ) : (
          <p>No nutrition summary available</p>
        )}
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-medium mb-2">Meals</h3>
        {plan.planData.meals && plan.planData.meals.length > 0 ? (
          plan.planData.meals.map((meal, index) => (
            <div key={index} className="mb-4">
              <h4 className="text-lg font-medium">{meal.name}</h4>
              <ul className="list-disc pl-5">
                {meal.foods.map((food, foodIndex) => (
                  <li key={foodIndex}>
                    {food.name} ({food.amount}) - {food.calories} kcal
                    <p className="text-sm text-gray-600">{food.description}</p>
                  </li>
                ))}
              </ul>
              <p className="text-sm mt-2">
                Total: {meal.calories} kcal, Protein: {meal.protein}, Carbs: {meal.carbs}, Fat: {meal.fat}
              </p>
            </div>
          ))
        ) : (
          <p>No meals available</p>
        )}
      </div>
      <div>
        <h3 className="text-xl font-medium mb-2">Tips</h3>
        {plan.planData.tips && plan.planData.tips.length > 0 ? (
          <ul className="list-disc pl-5">
            {plan.planData.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        ) : (
          <p>No tips available</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <Link to="/pages/dashboard" className="inline-block mb-4 text-blue-500 hover:underline">
        ← Back to Dashboard
      </Link>
      <h1 className="text-3xl font-bold mb-6 text-center">My Meal Plans</h1>

      {singlePlan ? (
        renderMealPlan(singlePlan)
      ) : mealPlans.length > 0 ? (
        mealPlans.map((plan) => renderMealPlan(plan))
      ) : (
        <p className="text-center">
          No meal plans found.{' '}
          <Link to="/nutrition-checker" className="text-blue-500 hover:underline">
            Create a new meal plan
          </Link>
        </p>
      )}
    </div>
  );
};

export default MealPlanViewer;
