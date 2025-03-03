import React from "react";

const Tips = ({ goal, fitnessLevel }) => {
  const tipsByGoal = {
    weightLoss: [
      "Focus on maintaining a calorie deficit through both diet and exercise",
      "Include both cardio and resistance training for optimal results",
      "High-intensity interval training (HIIT) can be especially effective for fat burning",
      "Stay consistent with your workouts - aim for at least 3-4 sessions per week",
      "Track your progress by taking measurements and photos, not just weighing yourself",
    ],
    muscleGain: [
      "Ensure you're in a slight calorie surplus to support muscle growth",
      "Prioritize protein intake (aim for 1.6-2.2g per kg of bodyweight)",
      "Focus on progressive overload - gradually increasing weight or reps",
      "Allow 48 hours of recovery for muscle groups between training sessions",
      "Get adequate sleep (7-9 hours) to maximize recovery and growth",
    ],
    endurance: [
      "Build your base with longer, lower-intensity sessions before adding intensity",
      "Gradually increase duration before increasing intensity",
      "Include cross-training to reduce injury risk and improve overall fitness",
      "Stay well-hydrated before, during, and after workouts",
      "Incorporate interval training to improve your lactate threshold",
    ],
    general: [
      "Consistency is more important than intensity when starting out",
      "Balance your training with a mix of cardio, strength, and flexibility work",
      "Listen to your body and adjust workouts as needed",
      "Find activities you enjoy to make fitness a sustainable lifestyle",
      "Set specific, measurable goals to track your progress",
    ],
  };

  const tipsByLevel = {
    beginner: [
      "Focus on learning proper form before increasing intensity",
      "Start with 2-3 workouts per week and gradually increase",
      "Allow extra recovery time between workouts",
      "Don't be afraid to modify exercises to match your fitness level",
      "Celebrate small wins along your fitness journey",
    ],
    intermediate: [
      "Consider adding periodization to your training to continue progress",
      "Experiment with different training styles to find what works best for you",
      "Pay attention to nutrition timing around your workouts",
      "Track your workouts to ensure progressive overload",
      "Consider adding targeted mobility work to improve performance",
    ],
    advanced: [
      "Incorporate deload weeks every 4-8 weeks to prevent overtraining",
      "Consider more specialized training splits for your specific goals",
      "Fine-tune your nutrition to optimize performance and recovery",
      "Add advanced techniques like drop sets, supersets, or tempo training",
      "Consider working with a coach for personalized programming",
    ],
  };

  // Get relevant tips based on user inputs
  const goalTips = tipsByGoal[goal] || tipsByGoal.general;
  const levelTips = tipsByLevel[fitnessLevel] || tipsByLevel.beginner;

  // Combine and select tips
  const selectedTips = [...goalTips.slice(0, 3), ...levelTips.slice(0, 2)];

  return (
    <ul className="space-y-3 list-disc pl-5">
      {selectedTips.map((tip, index) => (
        <li key={index} className="text-gray-700">
          {tip}
        </li>
      ))}
    </ul>
  );
};

export default Tips;
