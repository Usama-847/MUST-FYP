import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Box, Stack, Typography, Button } from "@mui/material";
import HeroBannerImage from "../assets/images/banner.png";

const HeroBanner = () => {
  const location = useLocation();

  return (
    <Box
      sx={{
        mt: { lg: "10px", xs: "70px" },
        ml: { sm: "50px" },
        display: "flex",
        alignItems: "center",
        flexDirection: { lg: "row", xs: "column" },
      }}
      position="relative"
      p="20px"
    >
      <Box flex="1">
        <Typography
          color="FF2625"
          fontWeight="600"
          fontSize={{ lg: "26px", xs: "22px" }}
        >
          Shape Up
        </Typography>
        <Typography
          fontWeight={700}
          sx={{ fontSize: { lg: "44px", xs: "32px" } }}
        >
          We are here to help <br /> you to achieve your <br /> fitness dreams.
        </Typography>

        <Stack direction="row" spacing={2}>
          {location.pathname === "/" && (
            <>
              <Button
                variant="contained"
                color="secondary"
                component={Link}
                to="/pages/register"
              >
                Register
              </Button>
              <Button
                variant="outlined"
                color="primary"
                component={Link}
                to="/pages/login"
              >
                Login
              </Button>
            </>
          )}
        </Stack>
      </Box>
      <Box flex="1">
        <img
          src={HeroBannerImage}
          alt="banner"
          className="img-fluid"
          style={{ maxWidth: "100%" }}
        />
      </Box>
    </Box>
  );
};

export default HeroBanner;
