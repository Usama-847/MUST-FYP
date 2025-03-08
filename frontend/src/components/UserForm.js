import React from "react";

const UserForm = ({
  userData,
  handleInputChange,
  generateWorkoutPlan,
  isGenerating,
}) => {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label
            htmlFor="weight"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your Weight (kg)
          </label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={userData.weight}
            onChange={handleInputChange}
            placeholder="Enter your weight"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="goal"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your Fitness Goal
          </label>
          <select
            id="goal"
            name="goal"
            value={userData.goal}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a goal</option>
            <option value="Weight Loss">Weight Loss</option>
            <option value="Muscle Gain">Muscle Gain</option>
            <option value="Endurance">Endurance</option>
            <option value="Flexibility">Flexibility</option>
            <option value="General Fitness">General Fitness</option>
          </select>
        </div>

        <div className="mb-4">
          <label
            htmlFor="fitnessLevel"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your Current Fitness Level
          </label>
          <select
            id="fitnessLevel"
            name="fitnessLevel"
            value={userData.fitnessLevel}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select your level</option>
            <option value="Beginner">Beginner (New to exercise)</option>
            <option value="Intermediate">Intermediate (Some experience)</option>
            <option value="Advanced">Advanced (Very experienced)</option>
          </select>
        </div>

        <div className="mb-4">
          <label
            htmlFor="daysPerWeek"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Days Available For Exercise Per Week
          </label>
          <select
            id="daysPerWeek"
            name="daysPerWeek"
            value={userData.daysPerWeek}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select days</option>
            <option value="2">2 days</option>
            <option value="3">3 days</option>
            <option value="4">4 days</option>
            <option value="5">5 days</option>
            <option value="6">6 days</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="limitations"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Any Physical Limitations or Injuries? (Optional)
        </label>
        <textarea
          id="limitations"
          name="limitations"
          value={userData.limitations}
          onChange={handleInputChange}
          placeholder="E.g., knee injury, back pain, etc."
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={generateWorkoutPlan}
          disabled={isGenerating}
          className={`w-full py-3 ${
            isGenerating
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-teal-500 hover:bg-teal-600"
          } text-white font-medium rounded-md transition duration-300`}
        >
          {isGenerating ? "Generating..." : "Generate My Workout Plan"}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
