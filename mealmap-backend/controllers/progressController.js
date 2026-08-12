const prisma = require('../config/prisma');

// @route  POST /api/progress  (protected)
const addLog = async (req, res, next) => {
  try {
    const { weight, caloriesConsumed, note } = req.body;
    const log = await prisma.progressLog.create({
      data: { userId: req.user.id, weight, caloriesConsumed, note },
    });
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/progress  (protected) — only this user's logs, oldest first
const getLogs = async (req, res, next) => {
  try {
    const logs = await prisma.progressLog.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'asc' },
    });
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

module.exports = { addLog, getLogs };
