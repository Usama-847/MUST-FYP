import React, { useState } from "react";
import { Container, Form, Button, Spinner, Card, Alert } from "react-bootstrap";

const ExercisePlanner = () => {
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("weight-loss");
  const [loading, setLoading] = useState(false);
  const [exercisePlan, setExercisePlan] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setExercisePlan(null);

    try {
      const response = await fetch(
        "http://localhost:9000/api/exercise/generate-plan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ weight, goal }),
          credentials: "include", // Include cookies if needed
          mode: "cors", // Explicitly request CORS mode
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to generate exercise plan"
        );
      }

      const data = await response.json();
      setExercisePlan(data.plan);
    } catch (err) {
      console.error("Error details:", err);
      setError(
        `An error occurred: ${err.message || "Failed to connect to server"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2>Exercise Planner</h2>
      <p>
        Welcome to the Exercise Planner! Our AI will create a customized workout
        plan based on your weight and fitness goals.
      </p>

      <Card className="mb-4 p-3">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Your Weight (in kg)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter your weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fitness Goal</Form.Label>
            <Form.Select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              required
            >
              <option value="weight-loss">Weight Loss</option>
              <option value="muscle-gain">Muscle Gain</option>
              <option value="endurance">Endurance</option>
              <option value="flexibility">Flexibility</option>
              <option value="general-fitness">General Fitness</option>
            </Form.Select>
          </Form.Group>

          <Button variant="primary" type="submit" disabled={loading || !weight}>
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Generating Plan...
              </>
            ) : (
              "Generate Exercise Plan"
            )}
          </Button>
        </Form>
      </Card>

      {error && (
        <Alert variant="danger">
          {error}
          <div className="mt-2">
            <small>Make sure your backend server is running on port 5000</small>
          </div>
        </Alert>
      )}

      {exercisePlan && (
        <Card>
          <Card.Header>Your Personalized Exercise Plan</Card.Header>
          <Card.Body>
            <div dangerouslySetInnerHTML={{ __html: exercisePlan }} />
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default ExercisePlanner;
