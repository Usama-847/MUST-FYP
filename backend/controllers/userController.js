import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      dateOfBirth: user.dateOfBirth,
      phone: user.phone,
      gender: user.gender,
      goals: user.goals,
      profileCompleted: user.profileCompleted,
      createdAt: user.createdAt,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      dateOfBirth: user.dateOfBirth,
      phone: user.phone,
      gender: user.gender,
      goals: user.goals,
      profileCompleted: user.profileCompleted,
      createdAt: user.createdAt,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      dateOfBirth: user.dateOfBirth,
      phone: user.phone,
      gender: user.gender,
      goals: user.goals || {},
      profileCompleted: user.profileCompleted,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        res.status(400);
        throw new Error('Email already in use');
      }
    }

    if (req.body.dateOfBirth) {
      const dob = new Date(req.body.dateOfBirth);
      const minAgeDate = new Date();
      minAgeDate.setFullYear(minAgeDate.getFullYear() - 13);
      if (dob > minAgeDate) {
        res.status(400);
        throw new Error('User must be at least 13 years old');
      }
    }

    if (req.body.phone && !/^\+?[\d\s-]{7,15}$/.test(req.body.phone)) {
      res.status(400);
      throw new Error('Invalid phone number format');
    }

    const validGenders = ['male', 'female', 'other'];
    if (req.body.gender && !validGenders.includes(req.body.gender)) {
      res.status(400);
      throw new Error('Invalid gender value');
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
    user.phone = req.body.phone || user.phone;
    user.gender = req.body.gender || user.gender;

    if (req.body.password) {
      user.password = req.body.password;
    }

    if (req.body.weightGoal || req.body.currentWeight || 
        req.body.targetWeight || req.body.timeframe || 
        req.body.activityLevel || req.body.dietType) {
      
      const validWeightGoals = ['lose', 'gain', 'maintain'];
      const validTimeframes = ['1month', '3months', '6months', '1year'];
      const validActivityLevels = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
      const validDietTypes = ['balanced', 'keto', 'paleo', 'vegetarian', 'vegan', 'mediterranean'];

      if (req.body.weightGoal && !validWeightGoals.includes(req.body.weightGoal)) {
        res.status(400);
        throw new Error('Invalid weight goal value');
      }
      if (req.body.timeframe && !validTimeframes.includes(req.body.timeframe)) {
        res.status(400);
        throw new Error('Invalid timeframe value');
      }
      if (req.body.activityLevel && !validActivityLevels.includes(req.body.activityLevel)) {
        res.status(400);
        throw new Error('Invalid activity level value');
      }
      if (req.body.dietType && !validDietTypes.includes(req.body.dietType)) {
        res.status(400);
        throw new Error('Invalid diet type value');
      }
      if (req.body.currentWeight && req.body.currentWeight < 0) {
        res.status(400);
        throw new Error('Current weight must be non-negative');
      }
      if (req.body.targetWeight && req.body.targetWeight < 0) {
        res.status(400);
        throw new Error('Target weight must be non-negative');
      }

      user.goals = {
        ...user.goals,
        weightGoal: req.body.weightGoal || user.goals?.weightGoal,
        currentWeight: req.body.currentWeight || user.goals?.currentWeight,
        targetWeight: req.body.targetWeight || user.goals?.targetWeight,
        timeframe: req.body.timeframe || user.goals?.timeframe,
        activityLevel: req.body.activityLevel || user.goals?.activityLevel,
        dietType: req.body.dietType || user.goals?.dietType,
        updatedAt: new Date(),
      };

      if (!user.goals?.createdAt) {
        user.goals.createdAt = new Date();
      }
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      dateOfBirth: updatedUser.dateOfBirth,
      phone: updatedUser.phone,
      gender: updatedUser.gender,
      goals: updatedUser.goals,
      profileCompleted: updatedUser.profileCompleted,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  if (user && (await user.matchPassword(currentPassword))) {
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password updated successfully',
    });
  } else {
    res.status(400);
    throw new Error('Current password is incorrect');
  }
});

const getUserSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (user) {
    res.json({
      settings: user.settings || {
        privacy: {
          makeProfilePublic: false,
          allowGoalSharing: false,
          enableProgressNotifications: true
        },
        notifications: {
          dailyReminders: true,
          weeklyProgressReports: true,
          goalAchievementAlerts: true
        }
      }
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const updateUserSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body;

  const user = await User.findById(req.user._id);

  if (user) {
    user.settings = settings;
    await user.save();

    res.json({
      message: 'Settings updated successfully',
      settings: user.settings,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const resetUserGoals = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.goals = {
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    user.profileCompleted = false;
    await user.save();

    res.json({
      message: 'Goals reset successfully',
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const exportUserData = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (user) {
    const exportData = {
      profile: {
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        phone: user.phone,
        gender: user.gender,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      goals: user.goals,
      settings: user.settings,
      profileCompleted: user.profileCompleted,
      exportedAt: new Date(),
    };

    res.json(exportData);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const deleteUserAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    await User.findByIdAndDelete(req.user._id);
    
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    
    res.json({
      message: 'Account deleted successfully',
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserSettings,
  updateUserSettings,
  resetUserGoals,
  exportUserData,
  deleteUserAccount,
};