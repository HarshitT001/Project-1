const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const generateToken = require('../utils/generateToken');

// Register
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    generateToken(res, user.id);

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: {
          age: user.age,
          gender: user.gender,
          height: user.height,
          weight: user.weight,
          activityLevel: user.activityLevel,
          goal: user.goal,
          dietType: user.dietType,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// Login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    generateToken(res, user.id);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: {
          age: user.age,
          gender: user.gender,
          height: user.height,
          weight: user.weight,
          activityLevel: user.activityLevel,
          goal: user.goal,
          dietType: user.dietType,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// Logout
const logoutUser = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({ message: 'Logged out' });
};

// Get current user
const getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      profile: {
        age: req.user.age,
        gender: req.user.gender,
        height: req.user.height,
        weight: req.user.weight,
        activityLevel: req.user.activityLevel,
        goal: req.user.goal,
        dietType: req.user.dietType,
      },
    },
  });
};

// Update profile
const updateProfile = async (req, res, next) => {
  try {
    const { age, gender, height, weight, activityLevel, goal, dietType } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        age,
        gender,
        height,
        weight,
        activityLevel,
        goal,
        dietType,
      },
    });

    res.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        profile: {
          age: updatedUser.age,
          gender: updatedUser.gender,
          height: updatedUser.height,
          weight: updatedUser.weight,
          activityLevel: updatedUser.activityLevel,
          goal: updatedUser.goal,
          dietType: updatedUser.dietType,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateProfile,
};