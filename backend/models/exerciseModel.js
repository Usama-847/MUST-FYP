import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  muscleGroup: {
    type: String,
    required: true,
  },
  exercises: [
    {
      name: {
        type: String,
        required: true,
      },
      path: {
        type: String,
        required: true,
      },
    },
  ],
});

// Explicitly set the collection name to "exercise"
const Exercise = mongoose.model("Exercise", exerciseSchema, "exercise");

export default Exercise;