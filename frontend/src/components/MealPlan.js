import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Badge,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import UserModal from "../components/MealUserModal";
import ThinkingAnimation from "../components/ThinkingAnimation";
import Header from "../components/Header";

const MealPlan = () => {
  // User input state
  const [userData, setUserData] = useState({
    weight: "",
    height: "",
    age: "",
    gender: "",
    dietaryPreference: "",
    allergies: "",
    fitnessGoal: "",
    mealsPerDay: "3",
    calorieTarget: "",
  });

  // Generated plan state
  const [mealPlan, setMealPlan] = useState(null);
  const [currentDate, setCurrentDate] = useState(
    new Date()
      .toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .split("/")
      .reverse()
      .join("-")
  );

  // UI state
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Get user from Redux store
  const { userInfo } = useSelector((state) => state.auth);

  // Add ref for the results section
  const resultsRef = useRef(null);

  // Add effect to scroll to results when meal plan is generated
  useEffect(() => {
    if (mealPlan && !isThinking && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mealPlan, isThinking]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const generateMealPlan = async () => {
    // Validate inputs
    if (
      !userData.weight ||
      !userData.height ||
      !userData.age ||
      !userData.gender ||
      !userData.dietaryPreference ||
      !userData.fitnessGoal ||
      !userData.mealsPerDay
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    // Start thinking phase and API call
    setIsThinking(true);
    setIsGenerating(true);

    const apiPromise = fetch("/api/meals/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...userData, date: currentDate }),
    });

    const timerPromise = new Promise((resolve) => setTimeout(resolve, 5000));

    try {
      const [response] = await Promise.all([apiPromise, timerPromise]);
      const data = await response.json();

      // Ensure the response data has the expected structure
      const planData = data.mealPlan || {};

      // Create a default structure if any part is missing
      const sanitizedPlan = {
        summary:
          planData.summary ||
          `${userData.mealsPerDay}-meal plan for ${userData.fitnessGoal} with ${userData.dietaryPreference} preference`,
        meals: Array.isArray(planData.meals) ? planData.meals : [],
        nutritionSummary: planData.nutritionSummary || {
          calories: "~" + (userData.calorieTarget || "2000"),
          protein: "~150g",
          carbs: "~200g",
          fat: "~70g",
        },
        tips: Array.isArray(planData.tips) ? planData.tips : [],
      };

      // If meals array is empty, create placeholder meals
      if (sanitizedPlan.meals.length === 0) {
        const mealNames = [
          "Breakfast",
          "Lunch",
          "Dinner",
          "Snack 1",
          "Snack 2",
        ];
        for (let i = 0; i < parseInt(userData.mealsPerDay); i++) {
          sanitizedPlan.meals.push({
            name: mealNames[i % 5],
            foods: [],
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
          });
        }
      }

      setMealPlan(sanitizedPlan);
      setIsThinking(false);
      setIsRevealing(true);
      setIsGenerating(false);

      toast.success("Meal plan generated successfully!");
    } catch (error) {
      console.error("Error generating meal plan:", error);
      toast.error("Failed to generate meal plan. Please try again.");
      setIsThinking(false);
      setIsGenerating(false);
    }
  };

  const handleSaveClick = () => {
    if (!userInfo) {
      toast.info("Please login to save your meal plan");
      return;
    }

    if (!mealPlan) {
      toast.error("No meal plan to save");
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
    // You can update the current meal plan with the saved version if needed
    if (savedPlan && savedPlan.planData) {
      setMealPlan(savedPlan.planData);
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
        mealPlan={mealPlan}
        userData={userData}
        onSave={handlePlanSaved}
      />

      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-teal-500 text-white py-6 px-4">
        <Container className="mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            AI Meal Planner
          </h1>
          <p className="text-base md:text-lg opacity-90">
            Customized meal plans powered by AI
          </p>
        </Container>
      </header>

      <Container className="py-6">
        {/* User Input Form */}
        <Card className="shadow-md mb-6">
          <Card.Body>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
              <h2 className="h4 mb-3 mb-md-0">
                Create Your Personalized Meal Plan
              </h2>
              {userInfo && (
                <button
                  onClick={handleViewSavedPlans}
                  className="px-4 py-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition duration-300"
                >
                  View Your Saved Plans
                </button>
              )}
            </div>

            {/* Rest of the form remains the same as in previous implementation */}
            <Form>
              {/* Form inputs... (same as before) */}
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="weight">
                    <Form.Label>Weight (kg)</Form.Label>
                    <Form.Control
                      type="number"
                      name="weight"
                      value={userData.weight}
                      onChange={handleInputChange}
                      placeholder="Enter weight"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="height">
                    <Form.Label>Height (cm)</Form.Label>
                    <Form.Control
                      type="number"
                      name="height"
                      value={userData.height}
                      onChange={handleInputChange}
                      placeholder="Enter height"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="age">
                    <Form.Label>Age</Form.Label>
                    <Form.Control
                      type="number"
                      name="age"
                      value={userData.age}
                      onChange={handleInputChange}
                      placeholder="Enter age"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="gender">
                    <Form.Label>Gender</Form.Label>
                    <Form.Select
                      name="gender"
                      value={userData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="dietaryPreference">
                    <Form.Label>Dietary Preference</Form.Label>
                    <Form.Select
                      name="dietaryPreference"
                      value={userData.dietaryPreference}
                      onChange={handleInputChange}
                    >
                      <option value="">Select preference</option>
                      <option value="no-restrictions">No Restrictions</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="pescatarian">Pescatarian</option>
                      <option value="keto">Keto</option>
                      <option value="paleo">Paleo</option>
                      <option value="mediterranean">Mediterranean</option>
                      <option value="gluten-free">Gluten-Free</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="fitnessGoal">
                    <Form.Label>Fitness Goal</Form.Label>
                    <Form.Select
                      name="fitnessGoal"
                      value={userData.fitnessGoal}
                      onChange={handleInputChange}
                    >
                      <option value="">Select goal</option>
                      <option value="weight-loss">Weight Loss</option>
                      <option value="muscle-gain">Muscle Gain</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="athletic-performance">
                        Athletic Performance
                      </option>
                      <option value="general-health">General Health</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="mealsPerDay">
                    <Form.Label>Meals Per Day</Form.Label>
                    <Form.Select
                      name="mealsPerDay"
                      value={userData.mealsPerDay}
                      onChange={handleInputChange}
                    >
                      <option value="3">3 (Standard)</option>
                      <option value="4">4 (Including Snack)</option>
                      <option value="5">5 (Including 2 Snacks)</option>
                      <option value="6">6 (Multiple Small Meals)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="calorieTarget">
                    <Form.Label>Daily Calorie Target (optional)</Form.Label>
                    <Form.Control
                      type="number"
                      name="calorieTarget"
                      value={userData.calorieTarget}
                      onChange={handleInputChange}
                      placeholder="Leave blank for AI recommendation"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="allergies">
                    <Form.Label>Allergies/Restrictions</Form.Label>
                    <Form.Control
                      type="text"
                      name="allergies"
                      value={userData.allergies}
                      onChange={handleInputChange}
                      placeholder="e.g., nuts, dairy, shellfish"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-grid gap-2 mt-4">
                <Button
                  variant="success"
                  size="lg"
                  onClick={generateMealPlan}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate Meal Plan"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        {/* Results Section */}
        {mealPlan && !isThinking && (
          <div ref={resultsRef}>
            <Card className="shadow-md mb-5">
              <Card.Body>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
                  <h2 className="h4 mb-3 mb-md-0">
                    Your AI-Generated Meal Plan
                  </h2>
                  {userInfo && (
                    <Button variant="teal" onClick={handleSaveClick}>
                      Save This Plan
                    </Button>
                  )}
                </div>
                {/* Rest of the results display... (same as before) */}{" "}
                <div className="mb-4">
                  <h3 className="h5 text-success">Plan Summary</h3>
                  <p>{mealPlan.summary}</p>

                  <div className="mt-3 mb-4">
                    <h4 className="h6">Daily Nutrition Targets</h4>
                    <Row className="mt-2">
                      <Col xs={6} md={3}>
                        <Badge bg="info" className="p-2 w-100">
                          Calories: {mealPlan.nutritionSummary.calories}
                        </Badge>
                      </Col>
                      <Col xs={6} md={3}>
                        <Badge bg="success" className="p-2 w-100">
                          Protein: {mealPlan.nutritionSummary.protein}
                        </Badge>
                      </Col>
                      <Col xs={6} md={3}>
                        <Badge bg="warning" className="p-2 w-100 mt-2 mt-md-0">
                          Carbs: {mealPlan.nutritionSummary.carbs}
                        </Badge>
                      </Col>
                      <Col xs={6} md={3}>
                        <Badge bg="danger" className="p-2 w-100 mt-2 mt-md-0">
                          Fat: {mealPlan.nutritionSummary.fat}
                        </Badge>
                      </Col>
                    </Row>
                  </div>
                </div>
                <div className="meal-plan-container">
                  {mealPlan.meals.map((meal, index) => (
                    <Card key={index} className="mb-3 meal-card">
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <h4 className="mb-0 h5">{meal.name}</h4>
                        <div className="d-flex">
                          <small className="text-muted me-2">
                            {meal.calories} cal
                          </small>
                          <small className="text-success me-2">
                            P: {meal.protein}g
                          </small>
                          <small className="text-warning me-2">
                            C: {meal.carbs}g
                          </small>
                          <small className="text-danger">F: {meal.fat}g</small>
                        </div>
                      </Card.Header>
                      <ListGroup variant="flush">
                        {meal.foods &&
                          meal.foods.map((food, foodIndex) => (
                            <ListGroup.Item
                              key={foodIndex}
                              className="meal-item"
                            >
                              <div className="d-flex justify-content-between">
                                <div>
                                  <strong>{food.name}</strong>
                                  {food.amount && (
                                    <span className="text-muted ms-2">
                                      {food.amount}
                                    </span>
                                  )}
                                </div>
                                {food.calories && (
                                  <small>{food.calories} cal</small>
                                )}
                              </div>
                              {food.description && (
                                <div className="text-muted small mt-1">
                                  {food.description}
                                </div>
                              )}
                            </ListGroup.Item>
                          ))}
                      </ListGroup>
                    </Card>
                  ))}
                </div>
              </Card.Body>
            </Card>

            {/* Tips Section */}
            <Card className="bg-light mb-4">
              <Card.Body>
                <h3 className="h5 text-primary mb-3">
                  Nutrition & Meal Prep Tips
                </h3>
                <ListGroup variant="flush">
                  {mealPlan.tips &&
                    mealPlan.tips.map((tip, index) => (
                      <ListGroup.Item
                        key={index}
                        className="bg-transparent border-0 ps-0"
                      >
                        <i className="fas fa-check-circle text-success me-2"></i>
                        {tip}
                      </ListGroup.Item>
                    ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </div>
        )}
      </Container>

      {/* Footer */}
      <footer className="mt-8 py-4 bg-gray-100 text-center text-gray-600">
        <Container>
          <p className="text-sm">
            This meal plan is generated by AI and should be used as a guideline
            only. Always consult with a healthcare or nutrition professional
            before making significant changes to your diet.
          </p>
          <p className="text-sm">
            © 2025 AI Meal Planner. All rights reserved.
          </p>
        </Container>
      </footer>
    </div>
  );
};

export default MealPlan;
