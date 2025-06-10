import React from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ContactUs = () => {
  return (
    <>
      <Header />
      <div style={{ backgroundColor: "#f9fafb", minHeight: "100vh", paddingTop: "40px", paddingBottom: "40px" }}>
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h1 className="display-5 fw-bold">Contact Us</h1>
              <p className="text-muted">
                We'd love to hear from you! Whether it's feedback, support, or partnership opportunities — drop us a message below.
              </p>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col md={8}>
              <Card className="shadow-sm border-0 p-4">
                <Form>
                  <Form.Group controlId="name" className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control type="text" placeholder="Enter your name" required />
                  </Form.Group>

                  <Form.Group controlId="email" className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control type="email" placeholder="Enter your email" required />
                  </Form.Group>

                  <Form.Group controlId="subject" className="mb-3">
                    <Form.Label>Subject</Form.Label>
                    <Form.Control type="text" placeholder="e.g. Feedback, Support..." />
                  </Form.Group>

                  <Form.Group controlId="message" className="mb-4">
                    <Form.Label>Message</Form.Label>
                    <Form.Control as="textarea" rows={5} placeholder="Type your message here..." required />
                  </Form.Group>

                  <div className="text-end">
                    <Button variant="primary" type="submit">
                      Send Message
                    </Button>
                  </div>
                </Form>
              </Card>
            </Col>
          </Row>

          <Row className="mt-5 text-center">
            <Col>
              <p className="text-muted">Or reach us directly at:</p>
              <p><strong>Email:</strong> support@fitlyapp.com</p>
              <p><strong>Phone:</strong> +92-XXX-XXXXXXX</p>
              <p><strong>Location:</strong> Lahore, Pakistan</p>
            </Col>
          </Row>
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default ContactUs;
