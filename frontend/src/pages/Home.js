import React from "react";
import { Container } from "react-bootstrap";

import HeroBanner from "../components/HeroBanner";
import HomeContent from "../components/HomeContent";

const Home = () => {
  return (
    <>
      <Container>
        <HeroBanner />
        <HomeContent />
      </Container>
    </>
  );
};

export default Home;
