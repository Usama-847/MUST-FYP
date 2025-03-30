import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ExerciseDB.css";

const ExercisePage = () => {
  const [selectedMuscle, setSelectedMuscle] = useState("");
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [exercisesPerPage] = useState(10);

  const handleMuscleChange = (e) => {
    setSelectedMuscle(e.target.value);
  };

  const handleSearch = async () => {
    if (!selectedMuscle) return;

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:9000/api/exercises/muscle/${selectedMuscle}`, {
        timeout: 5000,
      });
      console.log("Backend response:", response.data);

      if (response.data && response.data.exercises) {
        const groupedExercises = groupExercisesByName(response.data.exercises);
        console.log("Grouped exercises:", groupedExercises);
        setExercises(groupedExercises);
      } else {
        setExercises([]);
      }
    } catch (error) {
      console.error("Error fetching exercises:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      }
      setExercises([]);
    } finally {
      setLoading(false);
      setCurrentPage(1);
    }
  };

  const groupExercisesByName = (exerciseList) => {
    const exerciseMap = {};

    exerciseList.forEach((exercise) => {
      const match = exercise.name.match(/(.+?)-\d+\.(png|gif)$/);
      if (match) {
        const baseName = match[1];

        if (!exerciseMap[baseName]) {
          exerciseMap[baseName] = {
            name: baseName,
            images: [],
          };
        }

        const imageUrl = exercise.path;
        console.log(`Adding image for ${baseName}: ${imageUrl}`);
        exerciseMap[baseName].images.push(imageUrl);
      } else {
        console.warn(`Exercise name does not match expected pattern: ${exercise.name}`);
      }
    });

    return Object.values(exerciseMap);
  };

  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = exercises.slice(
    indexOfFirstExercise,
    indexOfLastExercise
  );

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const formatExerciseName = (name) => {
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div>
      <h2>Search For A Perfect Exercise</h2>
      <div className="select-container">
        <select value={selectedMuscle} onChange={handleMuscleChange}>
          <option value="">Select A Muscle Group</option>
          <option value="back">Back</option>
          <option value="cardio">Cardio</option>
          <option value="chest">Chest</option>
          <option value="lower arms">Lower Arms</option>
          <option value="lower legs">Lower Legs</option>
          <option value="neck">Neck</option>
          <option value="shoulders">Shoulders</option>
          <option value="upper arms">Upper Arms</option>
          <option value="upper legs">Upper Legs</option>
          <option value="waist">Waist</option>
        </select>
        <button onClick={handleSearch} className="mx-3" disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </button>
      </div>
      {currentExercises.length > 0 ? (
        <div className="exercise-container">
          {currentExercises.map((exercise, index) => (
            <div key={index} className="exercise-card">
              <h3>{formatExerciseName(exercise.name)}</h3>
              <div className="exercise-images">
                {exercise.images.length > 0 ? (
                  exercise.images.sort().map((imagePath, i) => (
                    <div key={i} className="gif-container">
                      <img
                        src={imagePath}
                        alt={`${exercise.name} position ${i + 1}`}
                        className="exercise-gif"
                        onError={(e) => console.error(`Failed to load image: ${imagePath}`)}
                        onLoad={() => console.log(`Successfully loaded image: ${imagePath}`)}
                      />
                      <p>{i === 0 ? "Start Position" : "End Position"}</p>
                    </div>
                  ))
                ) : (
                  <p>No images available for this exercise.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <h3>
          {loading ? "Loading exercises..." : "Exercises and demonstrations will be displayed here."}
        </h3>
      )}
      {exercises.length > exercisesPerPage && (
        <div className="pagination">
          {Array.from({
            length: Math.ceil(exercises.length / exercisesPerPage),
          }).map((_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={currentPage === index + 1 ? "active" : ""}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExercisePage;