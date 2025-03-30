import React from "react";
import { Link, useLocation } from "react-router-dom";
import HeroBannerImage from "../assets/images/banner.png";

const HeroBanner = () => {
  const location = useLocation();

  return (
    <div className="p-3 md:p-8">
      {/* Navigation Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-white font-semibold text-3xl lg:text-5xl py-4">
            FITLY
          </span>
          <span
            className="text-white font-semibold text-3xl lg:text-5xl py-2 px-2"
            style={{ animation: "subtleBounce 2s infinite" }}
          >
            AI
          </span>
        </div>

        {location.pathname === "/" && (
          <div className="flex flex-row space-x-2">
            <Link to="/pages/register">
              <button className="bg-secondary text-white py-2 px-4 rounded">
                Register
              </button>
            </Link>
            <Link to="/pages/login">
              <button className="border border-primary text-primary py-2 px-4 rounded">
                Login
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center mt-24">
        <div className="flex-1">
          <h1 className="font-bold text-white text-[32px] lg:text-[44px]">
            We are here to help <br /> you to achieve your <br /> fitness
            dreams.
          </h1>
        </div>
        <div className="flex-1 my-5">
          <img
            src={HeroBannerImage}
            alt="banner"
            className="max-w-full w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
