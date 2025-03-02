import React from "react";

const UserForm = ({ userData, handleInputChange, generateWorkoutPlan }) => {
  return (
    <form className="space-y-6">
      <div>
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
          min="30"
          max="250"
          required
          placeholder="Enter your weight"
          className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div>
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
          required
          className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="" disabled>
            Select your goal
          </option>
          <option value="weightLoss">Weight Loss</option>
          <option value="muscleGain">Muscle Gain</option>
          <option value="endurance">Improve Endurance</option>
          <option value="general">General Fitness</option>
        </select>
      </div>

      <div>
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
          required
          className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="" disabled>
            Select your level
          </option>
          <option value="beginner">Beginner (New to exercise)</option>
          <option value="intermediate">
            Intermediate (Exercise 1-3 times weekly)
          </option>
          <option value="advanced">Advanced (Exercise 4+ times weekly)</option>
        </select>
      </div>

      <div>
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
          required
          className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="" disabled>
            Select days per week
          </option>
          <option value="2">2 days</option>
          <option value="3">3 days</option>
          <option value="4">4 days</option>
          <option value="5">5 days</option>
          <option value="6">6 days</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="limitations"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Any Physical Limitations or Injuries? (Optional)
        </label>
        <input
          type="text"
          id="limitations"
          name="limitations"
          value={userData.limitations}
          onChange={handleInputChange}
          placeholder="E.g., knee injury, back pain, etc."
          className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <button
        type="button"
        onClick={generateWorkoutPlan}
        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-md transition duration-200"
      >
        Generate My Workout Plan
      </button>
    </form>
  );
};

export default UserForm;
