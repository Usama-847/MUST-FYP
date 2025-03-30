import React, { useState, useEffect, createContext } from "react";
import { Route, Routes } from "react-router-dom";
import { Box } from "@mui/material";
import { Container } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import Home from "./pages/Home";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Features from "./pages/Features";
import Workouts from "./pages/Workouts";
import BMRCalculator from "./pages/BMRCalculator";
import NutritionChecker from "./pages/NutritionChecker";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import ExercisePlanner from "./pages/ExercisePlanner";
import Dashboard from "./pages/Dashboard";
import Ai from "./pages/Ai";
import Contactus from "./pages/Contactus";
import MealPlan from "./components/MealPlan"; // Add this import

// Create authentication context
export const AuthContext = createContext();

const App = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axios.get("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data && response.data._id) {
            setUser(response.data);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem("token");
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Authentication error:", error);
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  const authContextValue = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <ToastContainer />
      <Box width="400px" sx={{ width: { x1: "1488px" } }} m="auto">
        {isAuthenticated && <Header />}
        {!loading && (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pages/features" element={<Features />} />
            <Route path="/pages/workouts" element={<Workouts />} />
            <Route path="/pages/contact" element={<Contactus />} />
            <Route path="/pages/about" element={<About />} />
            <Route
              path="/pages/exercise-planner"
              element={<ExercisePlanner />}
            />
            <Route path="/pages/dashboard" element={<Dashboard />} />
            <Route path="/pages/Ai" element={<Ai />} />
            <Route path="/pages/meal-plan" element={<MealPlan />} /> {/* Add this new route */}

            {/* Public Route */}
            <Route path="" element={<PublicRoute />}>
              <Route path="/pages/register" element={<Register />} />
              <Route path="/pages/login" element={<Login />} />
            </Route>

            {/* Private Route */}
            <Route path="" element={<PrivateRoute />}>
              <Route path="/pages/profile/*" element={<Profile />} />
            </Route>

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </Box>
      {isAuthenticated && <Footer />}
    </AuthContext.Provider>
  );
};

export default App;