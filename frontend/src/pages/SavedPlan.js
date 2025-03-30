import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import WorkoutPlan from "../components/WorkoutPlans";

const SavedPlans = () => {
  const [savedPlans, setSavedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Get user from Redux store
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  // Fetch saved plans on component mount
  useEffect(() => {
    // Redirect if not logged in
    if (!userInfo) {
      toast.error("Please login to view your saved plans");
      navigate("/login");
      return;
    }
    
    fetchSavedPlans();
  }, [userInfo, navigate]);
  
  const fetchSavedPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/workouts/saved");
      setSavedPlans(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching saved plans:", error);
      toast.error("Failed to fetch saved plans");
      setLoading(false);
    }
  };
  
  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };
  
  const handlePlanDelete = async (planId) => {
    try {
      await axios.delete(`/api/workouts/saved/${planId}`);
      toast.success("Plan deleted successfully");
      // Refresh plans list
      fetchSavedPlans();
      // Reset selected plan if it was deleted
      if (selectedPlan && selectedPlan._id === planId) {
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error("Failed to delete plan");
    }
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <ToastContainer position="top-right" autoClose={5000} />
      
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-teal-500 text-white py-6 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Your Saved Workout Plans</h1>
          <p className="text-base md:text-lg opacity-90">
            View and manage all your personalized workout plans
          </p>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-4 flex justify-between items-center">
          <Link 
            to="/exercise-planner" 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Create New Plan
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-2">Loading your saved plans...</p>
          </div>
        ) : savedPlans.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">No Saved Plans Yet</h2>
            <p className="text-gray-600 mb-4">Create your first personalized workout plan now!</p>
            <Link 
              to="/exercise-planner" 
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition duration-300"
            >
              Create Plan
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Your Plans</h2>
              <div className="max-h-96 overflow-y-auto">
                {savedPlans.map((plan) => (
                  <div 
                    key={plan._id} 
                    className={`mb-2 p-3 rounded-md border cursor-pointer transition duration-200 flex justify-between items-center ${
                      selectedPlan && selectedPlan._id === plan._id 
                        ? "bg-blue-50 border-blue-400" 
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    <div>
                      <h3 className="font-medium">{plan.name || "Unnamed Plan"}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(plan.createdAt).toLocaleDateString()} • {plan.userData.goal}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlanDelete(plan._id);
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete plan"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="md:col-span-2">
              {selectedPlan ? (
                <div className="bg-white rounded-lg shadow-md p-5">
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">
                    {selectedPlan.name || `${selectedPlan.planData.summary}`}
                  </h2>
                  <div className="text-sm text-gray-500 mb-4">
                    <p>Goal: {selectedPlan.userData.goal}</p>
                    <p>Days Per Week: {selectedPlan.userData.daysPerWeek}</p>
                    <p>Fitness Level: {selectedPlan.userData.fitnessLevel}</p>
                    <p>Created: {new Date(selectedPlan.createdAt).toLocaleDateString()}</p>
                  </div>
                  <WorkoutPlan 
                    plan={selectedPlan.planData} 
                    userWeight={selectedPlan.userData.weight}
                    isRevealing={false}
                  />
                  
                  {selectedPlan.planData.tips && selectedPlan.planData.tips.length > 0 && (
                    <div className="mt-6 bg-teal-50 border-l-4 border-teal-500 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-teal-600 mb-2">Tips For Success</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {selectedPlan.planData.tips.map((tip, index) => (
                          <li key={index} className="text-gray-700">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-10 text-center">
                  <p className="text-gray-600">Select a plan to view details</p>
                </div>
              )}
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

export default SavedPlans;