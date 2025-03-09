import React from "react";

const WorkoutPlan = ({ plan, userWeight, isRevealing }) => {
  // Helper function to calculate weight-based resistance if needed
  const calculateWeight = (percentage) => {
    if (!percentage || !userWeight) return "bodyweight";
    const weight = Math.round((parseFloat(userWeight) * percentage) / 5) * 5;
    return `${weight}kg`;
  };

  // Function to handle different weight formats
  const formatWeight = (weight) => {
    if (!weight) return "";
    if (typeof weight === "object" && weight.weightPercentage) {
      return calculateWeight(weight.weightPercentage);
    }
    if (weight === "bodyweight") return "bodyweight";
    if (weight === "n/a" || weight === "none") return "";

    // If it's a string like "based on fitness level"
    if (typeof weight === "string" && !weight.includes("%")) {
      return weight;
    }

    // Handle percentage format (e.g. "60%")
    if (typeof weight === "string" && weight.includes("%")) {
      const percentage = parseFloat(weight) / 100;
      return calculateWeight(percentage);
    }

    return weight;
  };

  if (!plan || !plan.workoutDays) {
    return <div className="text-center py-4">No workout plan available</div>;
  }

  return (
    <div
      className={`transition-opacity duration-1000 ${
        isRevealing ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="mb-6 p-4 bg-blue-50 rounded-md">
        <h3 className="font-semibold text-lg text-blue-800 mb-2">
          Plan Summary
        </h3>
        <p className="text-gray-700">{plan.summary}</p>
      </div>

      <div className="space-y-6">
        {plan.workoutDays.map((day, index) => (
          <div
            key={index}
            className="border-l-4 border-teal-500 bg-gray-50 p-4 rounded-r-md"
          >
            <h3 className="font-bold text-lg text-teal-700 mb-3">
              {day.day}: {day.focus}
            </h3>

            {day.warmup && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">
                  Warm-up (5-10 minutes)
                </h4>
                <p className="text-gray-600">{day.warmup}</p>
              </div>
            )}

            <div className="space-y-4">
              {day.exercises.map((exercise, exIndex) => (
                <div
                  key={exIndex}
                  className="border-b border-gray-200 pb-3 last:border-0"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{exercise.name}</span>
                    <span className="text-gray-600">
                      {exercise.sets} × {exercise.reps}
                    </span>
                  </div>

                  {exercise.weight && (
                    <div className="text-sm text-gray-500 mt-1">
                      Suggested weight: {formatWeight(exercise.weight)}
                    </div>
                  )}

                  {exercise.notes && (
                    <div className="text-sm text-gray-500 mt-1">
                      {exercise.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {day.cooldown && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2">
                  Cool Down (5-10 minutes)
                </h4>
                <p className="text-gray-600">{day.cooldown}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutPlan;
