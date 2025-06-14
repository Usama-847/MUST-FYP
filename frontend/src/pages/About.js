import React from "react";
import { Container, Row, Col, Card, ListGroup } from "react-bootstrap";
import Footer from "../components/Footer";
import Header from "../components/Header";

const AboutUs = () => {
  return (
    <>
      <Header />
      <div style={{ backgroundColor: "#f9fafb", minHeight: "100vh", paddingTop: "40px", paddingBottom: "40px" }}>
        <Container>
          <Row className="mb-5 text-center">
            <Col>
              <h1 className="display-5 fw-bold">About Fitly</h1>
              <p className="text-muted mt-3">
                AI-Powered Fitness & Meal Planning App built with the MERN stack
              </p>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={12}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <Card.Text>
                    <strong>Fitly</strong> helps users achieve their fitness goals by offering personalized exercise routines and meal plans, real-time progress tracking, and dynamic health tips using <strong>Google Gemini API</strong>.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-5 text-center align-items-center">
            <Col md={6}>
              <Card className="h-100 shadow-sm border-0 display-flex flex-column justify-content-between ">
                <Card.Header as="h5" className="bg-primary text-white">Key Features</Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item>AI-Powered Meal & Workout Recommendations</ListGroup.Item>
                  <ListGroup.Item>User Profiles with Goals & Preferences</ListGroup.Item>
                  <ListGroup.Item>Smart Meal Planning Based on Nutrition</ListGroup.Item>
                  <ListGroup.Item>Custom AI-Based Workout Routines</ListGroup.Item>
                  <ListGroup.Item>Progress Dashboard with Visualization</ListGroup.Item>
                  <ListGroup.Item>Adaptive Planning Based on Feedback</ListGroup.Item>

                </ListGroup>
              </Card>
            </Col>

            
          </Row>

          <Row>
            <Col>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <h5 className="card-title mb-3">AI & Data</h5>
                  <p>
                    Fitly uses the <strong>Google Gemini API</strong> to generate conversational, personalized plans and tips. It also uses:
                    Also used To Generate Exercise & Meal Plans.
                  </p>
                 
                  

                  <p className="mt-4">
                    Developed by <strong>Team Fitly</strong>, Full-Stack Developer.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default AboutUs;
