import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";

// Import icons from react-icons
import { FaUserPlus, FaUtensils, FaDumbbell, FaRobot } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

// Feature card component updated to render React Icon components
const FeatureCard = ({ title, description, link, icon }) => {
  return (
    <Card
      className="mb-4 text-center feature-card"
      style={{
        backgroundColor: "#14162b",
        borderRadius: "12px",
        border: "none",
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.4)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        height: "100%",
      }}
    >
      <Card.Body className="p-4 d-flex flex-column">
        {icon && (
          <div className="icon-container text-center mb-3">
            {React.cloneElement(icon, {
              size: 56,
              style: {
                marginBottom: "15px",
                filter: "drop-shadow(0 0 8px rgba(70, 129, 244, 0.4))",
              },
            })}
          </div>
        )}
        <div
          className="accent-line"
          style={{
            height: "3px",
            width: "40px",
            backgroundColor: "#4681f4",
            margin: "0 auto 20px",
            borderRadius: "2px",
          }}
        ></div>
        <Card.Title
          className="mt-2 mb-3"
          style={{
            color: "#ffffff",
            fontWeight: "600",
            fontSize: "1.4rem",
          }}
        >
          {title}
        </Card.Title>
        <Card.Text
          style={{
            color: "#9da1b4",
            flex: "1",
            fontSize: "0.95rem",
            marginBottom: "20px",
          }}
        >
          {description}
        </Card.Text>
        <Link
          to={link}
          className="btn mt-auto"
          style={{
            backgroundColor: "#4681f4",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            fontWeight: "500",
            color: "#ffffff",
            transition: "background-color 0.3s ease",
            textTransform: "uppercase",
            fontSize: "0.85rem",
            letterSpacing: "0.5px",
          }}
        >
          Learn More
        </Link>
      </Card.Body>
    </Card>
  );
};

const FeaturesPage = () => {
  const features = [
    {
      title: "Workout Database",
      description:
        "Our workout database is a comprehensive resource for anyone looking to improve their fitness. Find the perfect routine to target your specific goals.",
      link: "/pages/workouts",
      icon: null,
    },
    {
      title: "Nutrition Checker",
      description:
        "With Nutrition Checker, you can quickly and easily see the nutritional value of any food, including calories, fat, protein, carbohydrates.",
      link: "/pages/nutrition-checker",
      icon: null,
    },
    {
      title: "BMR Calculator",
      description:
        "Calculate your Basal Metabolic Rate (BMR) to determine your daily calorie needs. Get insights into your metabolism.",
      link: "/pages/bmr-calculator",
      icon: null,
    },
    {
      title: "Create Account",
      description:
        "Create a personalized account to access additional features, save your progress, and customize your experience.",
      link: "/pages/register",
      icon: <FaUserPlus />,
    },
    {
      title: "Meal Planner",
      description:
        "The Meal Planner helps you plan your meals for the day—a great way to save time, money, and eat healthier!",
      link: "/pages/profile/meal-plan",
      icon: <FaUtensils />,
    },
    {
      title: "Water Intake Log",
      description:
        "Track how much water you drink each day. Enter the amount of water with every drink to stay on top of your hydration.",
      link: "/pages/profile/water-intake",
      icon: null,
    },
    {
      title: "Exercise Planner",
      description:
        "Let our AI plan exercises tailored to your weight and fitness goals. Create customized workout plans that suit you.",
      link: "/pages/exercise-planner",
      icon: <FaDumbbell />,
    },
    {
      title: "Dashboard",
      description:
        "Access all your fitness metrics, progress tracking, and personalized recommendations in one centralized dashboard.",
      link: "/pages/dashboard",
      icon: <MdDashboard />,
    },
    {
      title: "AI ChatBot",
      description:
        "Get instant fitness advice, workout tips, and nutrition guidance from our smart AI assistant, customized for your journey.",
      link: "/pages/Ai",
      icon: <FaRobot />,
    },
  ];

  return (
    <div style={{ backgroundColor: "#0a0c1d", minHeight: "100vh", color: "#ffffff" }}>
      <Header />
      <Container className="py-5">
        <div className="text-center mb-5">
          <h1
            className="display-4 fw-bold"
            style={{
              color: "#ffffff",
              marginBottom: "15px",
              position: "relative",
              display: "inline-block",
            }}
          >
            FITNESS HYPER
            <span style={{ color: "#4681f4", position: "relative" }}> FEATURES</span>
          </h1>
          <p
            className="lead mb-4"
            style={{ color: "#9da1b4", maxWidth: "700px", margin: "0 auto" }}
          >
            Transform your fitness journey with our powerful tools designed to help you achieve your goals.
          </p>
          <div
            style={{
              height: "4px",
              width: "50px",
              backgroundColor: "#4681f4",
              margin: "25px auto",
              borderRadius: "2px",
            }}
          ></div>
        </div>

        <Row className="g-4 justify-content-center">
          {features.map((feature, index) => (
            <Col key={index} xs={12} md={6} lg={4}>
              <FeatureCard
                title={feature.title}
                description={feature.description}
                link={feature.link}
                icon={feature.icon}
              />
            </Col>
          ))}
        </Row>
      </Container>
      <Footer />
    </div>
  );
};

export default FeaturesPage;
