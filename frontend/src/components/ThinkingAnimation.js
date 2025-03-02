import React, { useState, useEffect } from "react";

const ThinkingAnimation = () => {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center py-8">
      <p className="text-xl md:text-5xl font-semibold text-gray-700 mt-20">
        Generating your personalized workout plan{".".repeat(dots)}
      </p>
    </div>
  );
};

export default ThinkingAnimation;
