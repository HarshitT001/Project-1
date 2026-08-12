const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const generateToken = require('../utils/generateToken');
const { generateOtp, sendOtpSms } = require('../utils/otp');

const shapeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  phoneVerified: user.phoneVerified,
  profile: {
    age: user.age,
    gender: user.gender,
    height: user.height,
    weight: user.weight,
    activityLevel: user.activityLevel,
    goal: user.goal,
    dietType: user.dietType,
  },
});

// @route  POST /api/auth/register
// Creates the account as UNVERIFIED and sends an OTP — no login cookie yet.
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Name, email, password and phone number are all required' });
    }

    const existsEmail = await prisma.user.findUnique({ where: { email } });
    if (existsEmail) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const existsPhone = await prisma.user.findUnique({ where: { phone } });
    if (existsPhone) {
      return res.status(400).json({ message: 'An account with this phone number already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, phone, otpCode: otp, otpExpiresAt },
    });

    await sendOtpSms(phone, otp);

    res.status(201).json({
      message: 'Account created. Enter the OTP sent to your phone to verify and continue.',
      email: user.email,
      needsVerification: true,
      // Only exposed outside production so you can test without a real SMS provider.
      ...(process.env.NODE_ENV !== 'production' ? { devOtp: otp } : {}),
    });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/auth/verify-otp
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Account not found' });
    if (user.phoneVerified) {
      return res.status(400).json({ message: 'Phone already verified — please log in' });
    }
    if (!user.otpCode || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP expired — request a new one' });
    }
    if (user.otpAttempts >= 5) {
      return res.status(429).json({ message: 'Too many incorrect attempts — request a new OTP' });
    }
    if (user.otpCode !== otp) {
      await prisma.user.update({ where: { id: user.id }, data: { otpAttempts: { increment: 1 } } });
      return res.status(400).json({ message: 'Incorrect OTP' });
    }

    const verified = await prisma.user.update({
      where: { id: user.id },
      data: { phoneVerified: true, otpCode: null, otpExpiresAt: null, otpAttempts: 0 },
    });

    generateToken(res, verified.id);
    res.json({ user: shapeUser(verified) });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/auth/resend-otp
const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Account not found' });
    if (user.phoneVerified) {
      return res.status(400).json({ message: 'Phone already verified — please log in' });
    }

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await prisma.user.update({ where: { id: user.id }, data: { otpCode: otp, otpExpiresAt, otpAttempts: 0 } });
    await sendOtpSms(user.phone, otp);

    res.json({
      message: 'A new OTP has been sent.',
      ...(process.env.NODE_ENV !== 'production' ? { devOtp: otp } : {}),
    });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/auth/login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.phoneVerified) {
      return res.status(403).json({
        message: 'Please verify your phone number to continue',
        needsVerification: true,
        email: user.email,
      });
    }

    generateToken(res, user.id);
    res.json({ user: shapeUser(user) });
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
  res.json({ user: shapeUser(req.user) });
};

// @route  PUT /api/auth/profile  (protected)
const updateProfile = async (req, res, next) => {
  try {
    const { age, gender, height, weight, activityLevel, goal, dietType } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { age, gender, height, weight, activityLevel, goal, dietType },
    });
    res.json({ user: shapeUser(updatedUser) });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  logoutUser,
  getMe,
  updateProfile,
};
