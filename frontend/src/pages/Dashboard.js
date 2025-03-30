import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  ProgressBar,
  Badge,
} from "react-bootstrap";
import { 
  BsPersonCircle, 
  BsListCheck, 
  BsActivity,
  BsPlus,
  BsThreeDotsVertical,
  BsCalendarCheck,
  BsArrowUpCircleFill,
  BsArrowDownCircleFill,
  BsHeartFill
} from "react-icons/bs";
import { FaWeight, FaRunning, FaAppleAlt, FaFire } from "react-icons/fa";
import axios from "axios";
import FormContainer from "../components/FormContainer";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import Header from "../components/Header";

const Dashboard = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [exercisePlans, setExercisePlans] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userInfo) {
      navigate("/");
    }
  }, [navigate, userInfo]);

  // Handler functions for navigation
  const handleNewDietPlan = () => {
    navigate("/pages/meal-plan");
  };

  const handleNewExercisePlan = () => {
    navigate("/pages/exercise-planner");
  };

  // Fetch exercise plans
  const fetchExercisePlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/exercise-plans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExercisePlans(response.data);
    } catch (error) {
      console.error("Error fetching exercise plans:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch meal plans
  const fetchMealPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/meal-plans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMealPlans(response.data);
    } catch (error) {
      console.error("Error fetching meal plans:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch plans on component mount
  useEffect(() => {
    fetchExercisePlans();
    fetchMealPlans();
  }, []);

  // ... (rest of your existing state declarations remain the same)
  const [dietPlans, setDietPlans] = useState([
    {
      id: 1,
      name: "Weight Loss Plan",
      status: "Active",
      adherence: 87,
      lastUpdated: "2025-02-28",
    },
    {
      id: 2,
      name: "Muscle Gain Diet",
      status: "Completed",
      adherence: 95,
      lastUpdated: "2025-02-20",
    },
    {
      id: 3,
      name: "Low Carb Plan",
      status: "Paused",
      adherence: 62,
      lastUpdated: "2025-02-15",
    },
    {
      id: 4,
      name: "Mediterranean Diet",
      status: "Active",
      adherence: 78,
      lastUpdated: "2025-02-25",
    },
  ]);

  const [steps, setSteps] = useState(6248);
  const [stepsGoal, setStepsGoal] = useState(10000);
  
  const [dailyStats, setDailyStats] = useState({
    water: 5,
    waterGoal: 8,
    sleep: 6.5,
    sleepGoal: 8,
    heartRate: 72,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSteps((prevSteps) => prevSteps + Math.floor(Math.random() * 10));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nutritionSummary = {
    calories: { consumed: 1850, goal: 2200 },
    protein: { consumed: 95, goal: 120 },
    carbs: { consumed: 220, goal: 250 },
    fat: { consumed: 65, goal: 73 },
  };

  const userStats = {
    weight: 75,
    height: 175,
    bmi: (75 / Math.pow(175 / 100, 2)).toFixed(1),
    weightDiff: -0.5,
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "Active":
        return "primary";
      case "Completed":
        return "success";
      case "Paused":
        return "warning";
      default:
        return "secondary";
    }
  };
  
  const calculateCircularProgress = (current, max) => {
    const percentage = (current / max) * 100;
    const circumference = 2 * Math.PI * 15.9155;
    const offset = circumference - (percentage / 100) * circumference;
    return {
      percentage,
      strokeDasharray: circumference,
      strokeDashoffset: offset,
    };
  };
  
  const stepsProgress = calculateCircularProgress(steps, stepsGoal);

  if (loading) return <Loader />;

  return (
    <div className="py-4" style={{ backgroundColor: "#f8f9fa" }}>
      <Header />
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-0">
              <BsPersonCircle className="me-2" />
              Welcome back, {userInfo?.name}
            </h2>
            <p className="text-muted mb-0">
              <BsCalendarCheck className="me-1" /> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        
        {/* Summary Cards Row */}
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3 mb-lg-0">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex align-items-center">
                <div className="rounded-circle p-3 me-3" style={{ backgroundColor: "rgba(13, 110, 253, 0.1)" }}>
                  <FaWeight size={24} className="text-primary" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Current Weight</h6>
                  <div className="d-flex align-items-center">
                    <h3 className="mb-0 me-2">{userStats.weight} kg</h3>
                    {userStats.weightDiff < 0 ? (
                      <span className="text-success d-flex align-items-center">
                        <BsArrowDownCircleFill className="me-1" /> {Math.abs(userStats.weightDiff)} kg
                      </span>
                    ) : (
                      <span className="text-danger d-flex align-items-center">
                        <BsArrowUpCircleFill className="me-1" /> {userStats.weightDiff} kg
                      </span>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={3} md={6} className="mb-3 mb-lg-0">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex align-items-center">
                <div className="rounded-circle p-3 me-3" style={{ backgroundColor: "rgba(220, 53, 69, 0.1)" }}>
                  <BsHeartFill size={24} className="text-danger" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">BMI Status</h6>
                  <div className="d-flex align-items-center">
                    <h3 className="mb-0 me-2">{userStats.bmi}</h3>
                    <span className={`${
                      userStats.bmi < 18.5
                        ? "text-warning"
                        : userStats.bmi < 25
                        ? "text-success"
                        : userStats.bmi < 30
                        ? "text-warning"
                        : "text-danger"
                    }`}>
                      {userStats.bmi < 18.5
                        ? "Underweight"
                        : userStats.bmi < 25
                        ? "Normal"
                        : userStats.bmi < 30
                        ? "Overweight"
                        : "Obese"}
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={3} md={6} className="mb-3 mb-lg-0">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex align-items-center">
                <div className="rounded-circle p-3 me-3" style={{ backgroundColor: "rgba(25, 135, 84, 0.1)" }}>
                  <FaAppleAlt size={24} className="text-success" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Daily Calories</h6>
                  <div className="d-flex align-items-center">
                    <h3 className="mb-0 me-2">{nutritionSummary.calories.consumed}</h3>
                    <span className="text-muted">/ {nutritionSummary.calories.goal} kcal</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={3} md={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex align-items-center">
                <div className="rounded-circle p-3 me-3" style={{ backgroundColor: "rgba(255, 193, 7, 0.1)" }}>
                  <FaRunning size={24} className="text-warning" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Activity Level</h6>
                  <div className="d-flex align-items-center">
                    <h3 className="mb-0 me-2">{((steps / stepsGoal) * 100).toFixed(0)}%</h3>
                    <span className="text-muted">{steps.toLocaleString()} steps</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Activity and Nutrition Row */}
        <Row className="mb-4">
          <Col lg={8} className="mb-4 mb-lg-0">
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-0 pt-4 px-4">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <BsListCheck className="me-2 text-primary" />
                    Diet Plan Status
                  </h5>
                  <Button variant="outline-primary" size="sm">View All</Button>
                </div>
              </Card.Header>
              <Card.Body className="px-4">
                <div className="table-responsive">
                  <Table hover className="align-middle">
                    <thead>
                      <tr>
                        <th>Plan Name</th>
                        <th>Status</th>
                        <th>Adherence</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dietPlans.map((plan) => (
                        <tr key={plan.id}>
                          <td className="fw-medium">{plan.name}</td>
                          <td>
                            <Badge 
                              bg={getStatusVariant(plan.status)}
                              pill
                              className="px-3 py-2"
                            >
                              {plan.status}
                            </Badge>
                          </td>
                          <td style={{ width: "25%" }}>
                            <div className="d-flex align-items-center">
                              <ProgressBar
                                now={plan.adherence}
                                variant={plan.adherence > 80 ? "success" : plan.adherence > 60 ? "warning" : "danger"}
                                style={{ height: "8px", flex: 1 }}
                                className="me-2"
                              />
                              <span>{plan.adherence}%</span>
                            </div>
                          </td>
                          <td>{plan.lastUpdated}</td>
                          <td>
                            <div className="d-flex">
                              <Button
                                size="sm"
                                variant="primary"
                                className="me-2"
                              >
                                Update
                              </Button>
                              <Button 
                                size="sm" 
                                variant="light"
                                className="d-flex align-items-center justify-content-center p-1"
                              >
                                <BsThreeDotsVertical />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            <Row>
              <Col xs={12} className="mb-4">
                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <Card.Title className="d-flex align-items-center mb-4">
                      <BsActivity className="me-2 text-primary" />
                      Step Counter
                    </Card.Title>
                    <div className="d-flex align-items-center">
                      <div className="position-relative me-4" style={{ width: "120px", height: "120px" }}>
                        <svg viewBox="0 0 36 36" className="position-absolute top-0 start-0 w-100 h-100" style={{ transform: "rotate(-90deg)" }}>
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#eee"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#0d6efd"
                            strokeWidth="3"
                            strokeDasharray={stepsProgress.strokeDasharray}
                            strokeDashoffset={stepsProgress.strokeDashoffset}
                          />
                        </svg>
                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                          <div className="text-center">
                            <h3 className="mb-0 fw-bold">{stepsProgress.percentage.toFixed(0)}%</h3>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-0">{steps.toLocaleString()}</h4>
                        <p className="text-muted mb-1">of {stepsGoal.toLocaleString()} steps</p>
                        <div className="d-flex align-items-center">
                          <FaFire className="text-warning me-1" />
                          <span>{Math.round(steps * 0.04)} calories burned</span>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col xs={12} className="mb-4">
                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <Card.Title className="mb-4">Exercise Plan</Card.Title>
                    {exercisePlans.length > 0 ? (
                      <ul className="list-unstyled">
                        {exercisePlans.slice(0, 3).map((plan) => ( // Display up to 3 plans
                          <li key={plan._id} className="mb-2">
                            {plan.name || "Unnamed Plan"} - {plan.status || "N/A"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted">No exercise plans saved yet</p>
                    )}
                    <Button 
                      variant="primary" 
                      className="d-flex align-items-center mt-2"
                      onClick={handleNewExercisePlan}
                    >
                      <BsPlus className="me-1" size={20} /> New Exercise Plan
                    </Button>
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12} className="mb-4">
                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <Card.Title className="mb-4">Meal Plan</Card.Title>
                    {mealPlans.length > 0 ? (
                      <ul className="list-unstyled">
                        {mealPlans.slice(0, 3).map((plan) => ( // Display up to 3 plans
                          <li key={plan._id} className="mb-2">
                            {plan.name || "Unnamed Plan"} - {plan.status || "N/A"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted">No meal plans saved yet</p>
                    )}
                    <Button 
                      variant="primary" 
                      className="d-flex align-items-center mt-2"
                      onClick={handleNewDietPlan}
                    >
                      <BsPlus className="me-1" size={20} /> New Diet Plan
                    </Button>
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12}>
                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <Card.Title className="mb-4">Today's Nutrition</Card.Title>
                    
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle p-2 me-2" style={{ backgroundColor: "rgba(13, 110, 253, 0.1)" }}>
                            <FaFire size={16} className="text-primary" />
                          </div>
                          <span>Calories</span>
                        </div>
                        <span className="fw-medium">
                          {nutritionSummary.calories.consumed} / {nutritionSummary.calories.goal} kcal
                        </span>
                      </div>
                      <ProgressBar
                        now={(nutritionSummary.calories.consumed / nutritionSummary.calories.goal) * 100}
                        style={{ height: "10px" }}
                        className="rounded-pill"
                      />
                    </div>

                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle p-2 me-2" style={{ backgroundColor: "rgba(25, 135, 84, 0.1)" }}>
                            <div className="bg-success rounded-circle" style={{ width: "16px", height: "16px" }}></div>
                          </div>
                          <span>Protein</span>
                        </div>
                        <span className="fw-medium">
                          {nutritionSummary.protein.consumed} / {nutritionSummary.protein.goal}g
                        </span>
                      </div>
                      <ProgressBar
                        variant="success"
                        now={(nutritionSummary.protein.consumed / nutritionSummary.protein.goal) * 100}
                        style={{ height: "10px" }}
                        className="rounded-pill"
                      />
                    </div>

                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle p-2 me-2" style={{ backgroundColor: "rgba(255, 193, 7, 0.1)" }}>
                            <div className="bg-warning rounded-circle" style={{ width: "16px", height: "16px" }}></div>
                          </div>
                          <span>Carbs</span>
                        </div>
                        <span className="fw-medium">
                          {nutritionSummary.carbs.consumed} / {nutritionSummary.carbs.goal}g
                        </span>
                      </div>
                      <ProgressBar
                        variant="warning"
                        now={(nutritionSummary.carbs.consumed / nutritionSummary.carbs.goal) * 100}
                        style={{ height: "10px" }}
                        className="rounded-pill"
                      />
                    </div>

                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle p-2 me-2" style={{ backgroundColor: "rgba(220, 53, 69, 0.1)" }}>
                            <div className="bg-danger rounded-circle" style={{ width: "16px", height: "16px" }}></div>
                          </div>
                          <span>Fat</span>
                        </div>
                        <span className="fw-medium">
                          {nutritionSummary.fat.consumed} / {nutritionSummary.fat.goal}g
                        </span>
                      </div>
                      <ProgressBar
                        variant="danger"
                        now={(nutritionSummary.fat.consumed / nutritionSummary.fat.goal) * 100}
                        style={{ height: "10px" }}
                        className="rounded-pill"
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
};

export default Dashboard;