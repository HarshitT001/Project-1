const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @route  POST /api/auth/register
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }
    const user = await User.create({ name, email, password });
    generateToken(res, user._id);
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, profile: user.profile },
    });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/auth/login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    generateToken(res, user._id);
    res.json({
      user: { id: user._id, name: user.name, email: user.email, profile: user.profile },
    });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/auth/logout
const logoutUser = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: 'Logged out' });
};

// @route  GET /api/auth/me  (protected)
const getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      profile: req.user.profile,
    },
  });
};

// @route  PUT /api/auth/profile  (protected)
const updateProfile = async (req, res, next) => {
  try {
    const { age, gender, height, weight, activityLevel, goal, dietType } = req.body;
    req.user.profile = { age, gender, height, weight, activityLevel, goal, dietType };
    await req.user.save();
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        profile: req.user.profile,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { registerUser, loginUser, logoutUser, getMe, updateProfile };
