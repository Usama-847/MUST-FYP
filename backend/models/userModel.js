import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
    },
    phone: {
      type: String,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    // Goal-related fields
    goals: {
      weightGoal: {
        type: String,
        enum: ['lose', 'gain', 'maintain'],
      },
      currentWeight: {
        type: Number,
        min: 0,
      },
      targetWeight: {
        type: Number,
        min: 0,
      },
      timeframe: {
        type: String,
        enum: ['1month', '3months', '6months', '1year'],
      },
      activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      },
      dietType: {
        type: String,
        enum: ['balanced', 'keto', 'paleo', 'vegetarian', 'vegan', 'mediterranean'],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    // Settings
    settings: {
      privacy: {
        makeProfilePublic: {
          type: Boolean,
          default: false,
        },
        allowGoalSharing: {
          type: Boolean,
          default: false,
        },
        enableProgressNotifications: {
          type: Boolean,
          default: true,
        },
      },
      notifications: {
        dailyReminders: {
          type: Boolean,
          default: true,
        },
        weeklyProgressReports: {
          type: Boolean,
          default: true,
        },
        goalAchievementAlerts: {
          type: Boolean,
          default: true,
        },
      },
    },
    // Profile completion status
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Update goals timestamp when goals are modified
userSchema.pre("save", function (next) {
  if (this.isModified("goals")) {
    this.goals.updatedAt = new Date();
    
    // Check if profile is completed based on goals
    this.profileCompleted = !!(
      this.goals.weightGoal &&
      this.goals.currentWeight &&
      this.goals.targetWeight &&
      this.goals.timeframe &&
      this.goals.activityLevel
    );
  }
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;