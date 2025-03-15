import React from "react";

const UserForm = ({
  userData,
  handleInputChange,
  generateWorkoutPlan,
  isGenerating,
}) => {
  return (
    <form className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weight field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weight (kg/lbs) *
          </label>
          <input
            type="text"
            name="weight"
            value={userData.weight}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 70kg or 154lbs"
            required
          />
        </div>

        {/* Height field (new) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height (cm/ft) *
          </label>
          <input
            type="text"
            name="height"
            value={userData.height}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 175cm or 5'9"
            required
          />
        </div>

        {/* Goal field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Goal *
          </label>
          <select
            name="goal"
            value={userData.goal}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Goal</option>
            <option value="Weight Loss">Weight Loss</option>
            <option value="Muscle Building">Muscle Building</option>
            <option value="Strength">Strength</option>
            <option value="Endurance">Endurance</option>
            <option value="General Fitness">General Fitness</option>
          </select>
        </div>

        {/* Fitness Level field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fitness Level *
          </label>
          <select
            name="fitnessLevel"
            value={userData.fitnessLevel}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {/* Days per week field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Days Per Week *
          </label>
          <select
            name="daysPerWeek"
            value={userData.daysPerWeek}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Days</option>
            <option value="2">2 days</option>
            <option value="3">3 days</option>
            <option value="4">4 days</option>
            <option value="5">5 days</option>
            <option value="6">6 days</option>
          </select>
        </div>

        {/* Limitations field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Limitations/Injuries (Optional)
          </label>
          <input
            type="text"
            name="limitations"
            value={userData.limitations}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Knee injury, shoulder pain"
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={generateWorkoutPlan}
          disabled={isGenerating}
          className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 disabled:opacity-70"
        >
          {isGenerating ? "Generating..." : "Generate Workout Plan"}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
