import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
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

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
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

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
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

// @desc    Update user profile (including goals)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Update basic profile fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
    user.phone = req.body.phone || user.phone;
    user.gender = req.body.gender || user.gender;

    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    // Update goals if provided
    if (req.body.weightGoal || req.body.currentWeight || 
        req.body.targetWeight || req.body.timeframe || 
        req.body.activityLevel || req.body.dietType) {
      
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

      // If this is the first time setting goals, set createdAt
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

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
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

// @desc    Get user settings
// @route   GET /api/users/settings
// @access  Private
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

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
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

// @desc    Reset user goals
// @route   DELETE /api/users/reset-goals
// @access  Private
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

// @desc    Export user data
// @route   GET /api/users/export-data
// @access  Private
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

// @desc    Delete user account
// @route   DELETE /api/users/delete-account
// @access  Private
const deleteUserAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    await User.findByIdAndDelete(req.user._id);
    
    // Clear the JWT cookie
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