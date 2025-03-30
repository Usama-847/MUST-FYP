import React, { useState } from "react";
import axios from "axios";

const ExercisePage = () => {
  const [selectedMuscle, setSelectedMuscle] = useState("");
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const exercisesPerPage = 10;

  const muscleGroups = [
    "back",
    // "cardio",
    "chest",
    // "lower arms",
    "lower legs",
    "neck",
    "shoulders",
    "upper arms",
    "upper legs",
    "waist",
  ];

  const handleSearch = async () => {
    if (!selectedMuscle) {
      setError("Please select a muscle group");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `http://localhost:9000/api/exercises/muscle/${selectedMuscle}`,
        { timeout: 5000 }
      );

      if (!response.data?.exercises?.length) {
        setExercises([]);
        setError("No exercises found for this muscle group");
        return;
      }

      const groupedExercises = groupExercisesByName(response.data.exercises);
      setExercises(groupedExercises);
      setCurrentPage(1);

      // Scroll to results
      document
        .getElementById("results-area")
        .scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const groupExercisesByName = (exercises) => {
    const exerciseMap = exercises.reduce((acc, exercise) => {
      const match = exercise.name.match(/(.+?)-\d+\.(png|gif)$/);
      if (!match) return acc;

      const baseName = match[1];
      if (!acc[baseName]) {
        acc[baseName] = {
          name: baseName,
          images: [],
        };
      }

      acc[baseName].images.push(exercise.path);
      return acc;
    }, {});

    return Object.values(exerciseMap).map((ex) => ({
      ...ex,
      images: ex.images.sort(),
    }));
  };

  const handleApiError = (error) => {
    console.error("API Error:", error);
    let message = "Failed to fetch exercises";

    if (error.response) {
      message = `Server error: ${error.response.status}`;
    } else if (error.request) {
      message = "No response from server";
    } else {
      message = error.message;
    }

    setError(message);
    setExercises([]);
  };

  const formatExerciseName = (name) => {
    return name.replace(/(^\w|-\w)/g, (match) =>
      match.replace(/-/, " ").toUpperCase()
    );
  };

  // Pagination calculations
  const indexOfLastExercise = currentPage * exercisesPerPage;
  const currentExercises = exercises.slice(
    indexOfLastExercise - exercisesPerPage,
    indexOfLastExercise
  );

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-center mt-6 mb-6 text-white">
        Exercise Database
      </h2>

      {/* Search controls - fixed position below header */}
      <div className="sticky top-20 right-0 z-10 bg-white py-4 border-b border-gray-200 mb-6 shadow-md">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 px-4">
          <select
            value={selectedMuscle}
            onChange={(e) => setSelectedMuscle(e.target.value)}
            disabled={loading}
            className="p-2 border border-gray-300 rounded-md min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Muscle Group</option>
            {muscleGroups.map((group) => (
              <option key={group} value={group}>
                {group.charAt(0).toUpperCase() + group.slice(1)}
              </option>
            ))}
          </select>

          <button
            onClick={handleSearch}
            disabled={loading || !selectedMuscle}
            className={`px-4 py-2 rounded-md text-white transition-colors ${
              loading || !selectedMuscle
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Searching..." : "Find Exercises"}
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-center mt-4 p-2 bg-red-50 rounded mx-4">
            {error}
          </div>
        )}
      </div>

      {/* Results area with ID for scrolling */}
      <div id="results-area" className="px-6 pb-8">
        {loading ? (
          <div className="text-center p-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading exercises...</p>
          </div>
        ) : currentExercises.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6">
              {currentExercises.map((exercise, index) => (
                <div
                  key={`${exercise.name}-${index}`}
                  className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white"
                >
                  <h3 className="text-lg font-semibold text-center mb-4 text-gray-800">
                    {formatExerciseName(exercise.name)}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {exercise.images.map((img, idx) => (
                      <figure key={img} className="flex flex-col items-center">
                        <div className="w-full h-[180px] flex items-center justify-center">
                          <img
                            src={img}
                            alt={`${exercise.name} position ${idx + 1}`}
                            className="max-w-full max-h-full object-contain border border-gray-100 rounded"
                            onError={(e) => {
                              e.target.src = "/fallback-exercise.jpg";
                            }}
                          />
                        </div>
                        <figcaption className="mt-2 text-sm font-medium text-gray-600">
                          {idx === 0
                            ? "Starting Position"
                            : `Position ${idx + 1}`}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              totalExercises={exercises.length}
              exercisesPerPage={exercisesPerPage}
              currentPage={currentPage}
              paginate={setCurrentPage}
            />
          </>
        ) : (
          !error && (
            <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">
              Select a muscle group to find related exercises
            </div>
          )
        )}
      </div>
    </div>
  );
};

const Pagination = ({
  totalExercises,
  exercisesPerPage,
  currentPage,
  paginate,
}) => {
  const pageNumbers = Array.from(
    { length: Math.ceil(totalExercises / exercisesPerPage) },
    (_, i) => i + 1
  );

  if (pageNumbers.length <= 1) return null;

  return (
    <nav className="flex justify-center mt-8 flex-wrap gap-2">
      {pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => paginate(number)}
          className={`mx-1 px-3 py-1 border rounded ${
            currentPage === number
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
          aria-label={`Go to page ${number}`}
        >
          {number}
        </button>
      ))}
    </nav>
  );
};

export default ExercisePage;
