import React, { useState } from "react";

const ExercisePage = () => {
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
      console.log("Fetching exercises for:", selectedMuscle);
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
      console.log("Response data:", data);
      setExercises(data);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      alert(`Error: ${error.message}`);
      setExercises([]);
    }
  };

  return (
    <div>
      <h1>Exercise Finder</h1>
      <select
        value={selectedMuscle}
        onChange={(e) => setSelectedMuscle(e.target.value)}
      >
        <option value="">Select Muscle Group</option>
        {muscleGroups.map((group) => (
          <option key={group} value={group}>
            {group}
          </option>
        ))}
      </select>
      <button onClick={handleSearch}>Search</button>

      <div>
        {exercises.length > 0 ? (
          <ul>
            {exercises.map((exercise, index) => (
              <li key={index}>
                <h3>{exercise.name}</h3>
                <img src={exercise.path} alt={exercise.name} width="200" />
              </li>
            ))}
          </ul>
        ) : (
          <p>No exercises found.</p>
        )}
      </div>
    </div>
  );
};

export default ExercisePage;
