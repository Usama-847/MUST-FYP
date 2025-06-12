import React, { useState } from "react";
import { Box } from "@mui/material";
import Footer from "../components/Footer";
import Header from "../components/Header";

const Workouts = () => {
  const [selectedMuscle, setSelectedMuscle] = useState("");
  const [exercises, setExercises] = useState([]);

  const muscleGroups = [
    "back",
    "cardio",
    "chest",
    "lower arms",
    "lower legs",
    "neck",
    "shoulders",
    "upper arms",
    "upper legs",
    "waist",
  ];

  const handleSearch = async () => {
    if (!selectedMuscle) {
      alert("Please select a muscle group");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:9000/api/exercises/${encodeURIComponent(
          selectedMuscle
        )}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`
        );
      }
      const data = await response.json();
      const groupedExercises = data.reduce((acc, exercise) => {
    const baseName = (exercise.name || "").split("-")[0].trim();

        if (!acc[baseName]) acc[baseName] = [];
        acc[baseName].push(exercise);
        return acc;
      }, {});

      const processedExercises = [];
      Object.entries(groupedExercises).forEach(([baseName, variants]) => {
        if (variants.length === 1) {
          processedExercises.push({
            name: baseName,
            paths: [variants[0].path],
          });
        } else {
          const variationGroups = {};
          variants.forEach((variant) => {
            const fullName = variant.name || "";
              const variationKey = fullName.includes("-")
              ? fullName.split("-").slice(0, -1).join("-")
                : fullName;


            if (!variationGroups[variationKey]) {
              variationGroups[variationKey] = [];
            }
            variationGroups[variationKey].push(variant);
          });

          Object.entries(variationGroups).forEach(([varName, varExercises]) => {
            processedExercises.push({
              name: varName || baseName,
              paths: varExercises.map((ex) => ex.path),
            });
          });
        }
      });

      setExercises(processedExercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      alert(`Error: ${error.message}`);
      setExercises([]);
    }
  };

  const handleReset = () => {
    setSelectedMuscle("");
    setExercises([]);
  };

  return (
    <>
      <Header />
      <Box
        sx={{
          marginTop: 10,
          padding: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          width: "100%",
        }}
      >
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            fontFamily: "sans-serif",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#fff",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          }}
        >
          <header
            style={{
              padding: "1.5rem 1rem",
              backgroundColor: "#f0f0f0",
              textAlign: "center",
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            Exercise Finder
          </header>

          <section
            style={{
              padding: "2rem 3rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              flexWrap: "wrap",
              marginBottom: "1rem",
            }}
          >
            <select
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
              style={{ padding: "0.5rem", fontSize: "1rem" }}
            >
              <option value="">Select Muscle Group</option>
              {muscleGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>

            <button
              onClick={handleSearch}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Search
            </button>

            <button
              onClick={handleReset}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Reset
            </button>
          </section>

          <section
            style={{
              flex: "1",
              overflowY: "auto",
              overflowX: "hidden",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            {exercises.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {exercises.map((exercise, index) => (
                  <div
                    key={index}
                    style={{
                      width: "100%",
                      textAlign: "center",
                      border: "1px solid #ccc",
                      padding: "0.5rem",
                      borderRadius: "8px",
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <h3 style={{ fontSize: "1rem", margin: "0 0 0.5rem 0" }}>
                      {index + 1}. {exercise.name}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                      }}
                    >
                      {(exercise.paths || []).map((path, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: "220px",
                            height: "220px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "6px",
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #e9ecef",
                          }}
                        >
                          <img
                            src={path}
                            alt={`${exercise.name} ${idx + 1}`}
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              objectFit: "contain",
                              borderRadius: "4px",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: "center" }}>No exercises found.</p>
            )}
          </section>
        </div>
      </Box>
      <Footer />
    </>
  );
};

export default Workouts;
