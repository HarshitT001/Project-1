const ProgressLog = require('../models/ProgressLog');

// @route  POST /api/progress  (protected)
const addLog = async (req, res, next) => {
  try {
    const log = await ProgressLog.create({ ...req.body, user: req.user._id });
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/progress  (protected) — only this user's logs, oldest first
const getLogs = async (req, res, next) => {
  try {
    const logs = await ProgressLog.find({ user: req.user._id }).sort({ date: 1 });
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

module.exports = { addLog, getLogs };
