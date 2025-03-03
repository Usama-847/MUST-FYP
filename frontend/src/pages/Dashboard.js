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
import { BsPersonCircle, BsListCheck, BsActivity } from "react-icons/bs";
import FormContainer from "../components/FormContainer";
import Footer from "../components/Footer";
import Loader from "../components/Loader";

const Dashboard = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userInfo) {
      navigate("/");
    }
  }, [navigate, userInfo]);

  // Sample data for diet plan status
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

  // Step counter state
  const [steps, setSteps] = useState(6248);
  const [stepsGoal, setStepsGoal] = useState(10000);

  // Simulating step counter updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSteps((prevSteps) => prevSteps + Math.floor(Math.random() * 10));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Diet analytics data
  const nutritionSummary = {
    calories: { consumed: 1850, goal: 2200 },
    protein: { consumed: 95, goal: 120 },
    carbs: { consumed: 220, goal: 250 },
    fat: { consumed: 65, goal: 73 },
  };

  // Calculate BMI (simulated for demo)
  const userStats = {
    weight: 75, // kg
    height: 175, // cm
    bmi: (75 / Math.pow(175 / 100, 2)).toFixed(1),
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

  if (loading) return <Loader />;

  return (
    <div className="py-5">
      <FormContainer>
        <h2 className="text-center mb-4">
          <BsPersonCircle className="me-2" />
          {userInfo?.name}'s Fitness Dashboard
        </h2>

        <Row className="mb-4">
          <Col md={6}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title className="d-flex align-items-center">
                  <BsActivity className="me-2 text-primary" />
                  Step Counter
                </Card.Title>
                <div className="text-center my-4">
                  <div className="position-relative d-inline-block">
                    <div
                      style={{ width: "180px", height: "180px" }}
                      className="position-relative"
                    >
                      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                        <div>
                          <h3 className="mb-0">{steps.toLocaleString()}</h3>
                          <small className="text-muted">
                            of {stepsGoal.toLocaleString()} steps
                          </small>
                        </div>
                      </div>
                      <svg
                        viewBox="0 0 36 36"
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{ transform: "rotate(-90deg)" }}
                      >
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
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p>{((steps / stepsGoal) * 100).toFixed(1)}% of daily goal</p>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>Today's Nutrition</Card.Title>

                <div className="my-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Calories</span>
                    <span>
                      {nutritionSummary.calories.consumed} /{" "}
                      {nutritionSummary.calories.goal} kcal
                    </span>
                  </div>
                  <ProgressBar
                    now={
                      (nutritionSummary.calories.consumed /
                        nutritionSummary.calories.goal) *
                      100
                    }
                    style={{ height: "10px" }}
                  />
                </div>

                <div className="my-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Protein</span>
                    <span>
                      {nutritionSummary.protein.consumed} /{" "}
                      {nutritionSummary.protein.goal}g
                    </span>
                  </div>
                  <ProgressBar
                    variant="success"
                    now={
                      (nutritionSummary.protein.consumed /
                        nutritionSummary.protein.goal) *
                      100
                    }
                    style={{ height: "10px" }}
                  />
                </div>

                <div className="my-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Carbs</span>
                    <span>
                      {nutritionSummary.carbs.consumed} /{" "}
                      {nutritionSummary.carbs.goal}g
                    </span>
                  </div>
                  <ProgressBar
                    variant="warning"
                    now={
                      (nutritionSummary.carbs.consumed /
                        nutritionSummary.carbs.goal) *
                      100
                    }
                    style={{ height: "10px" }}
                  />
                </div>

                <div className="my-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Fat</span>
                    <span>
                      {nutritionSummary.fat.consumed} /{" "}
                      {nutritionSummary.fat.goal}g
                    </span>
                  </div>
                  <ProgressBar
                    variant="danger"
                    now={
                      (nutritionSummary.fat.consumed /
                        nutritionSummary.fat.goal) *
                      100
                    }
                    style={{ height: "10px" }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={12}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title className="d-flex align-items-center">
                  <BsListCheck className="me-2 text-primary" />
                  Diet Plan Status
                </Card.Title>
                <div className="table-responsive mt-3">
                  <Table hover>
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
                          <td>{plan.name}</td>
                          <td>
                            <Badge bg={getStatusVariant(plan.status)}>
                              {plan.status}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <ProgressBar
                                now={plan.adherence}
                                style={{ height: "8px", flex: 1 }}
                                className="me-2"
                              />
                              <span className="text-muted small">
                                {plan.adherence}%
                              </span>
                            </div>
                          </td>
                          <td>{plan.lastUpdated}</td>
                          <td>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="me-2"
                            >
                              Update
                            </Button>
                            <Button size="sm" variant="outline-danger">
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Card className="shadow-sm">
              <Card.Body>
                <Row>
                  <Col md={4} className="text-center border-end">
                    <h5>BMI</h5>
                    <h3
                      className={`mt-2 ${
                        userStats.bmi < 18.5
                          ? "text-warning"
                          : userStats.bmi < 25
                          ? "text-success"
                          : userStats.bmi < 30
                          ? "text-warning"
                          : "text-danger"
                      }`}
                    >
                      {userStats.bmi}
                    </h3>
                    <p className="text-muted">
                      {userStats.bmi < 18.5
                        ? "Underweight"
                        : userStats.bmi < 25
                        ? "Normal"
                        : userStats.bmi < 30
                        ? "Overweight"
                        : "Obese"}
                    </p>
                  </Col>
                  <Col md={4} className="text-center border-end">
                    <h5>Weight</h5>
                    <h3 className="mt-2">{userStats.weight} kg</h3>
                    <p className="text-muted">Current</p>
                  </Col>
                  <Col md={4} className="text-center">
                    <h5>Height</h5>
                    <h3 className="mt-2">{userStats.height} cm</h3>
                    <p className="text-muted">Current</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </FormContainer>
      <Footer />
    </div>
  );
};

export default Dashboard;
