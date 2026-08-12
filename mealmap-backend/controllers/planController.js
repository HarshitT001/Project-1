const prisma = require('../config/prisma');

// @route  POST /api/plans  (protected)
const createPlan = async (req, res, next) => {
  try {
    const { targetCalories, tdee, goal, dietType, meals, totals } = req.body;
    const plan = await prisma.dietPlan.create({
      data: { userId: req.user.id, targetCalories, tdee, goal, dietType, meals, totals },
    });
    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/plans  (protected) — only this user's plans
const getPlans = async (req, res, next) => {
  try {
    const plans = await prisma.dietPlan.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(plans);
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/plans/:id  (protected)
const getPlan = async (req, res, next) => {
  try {
    const plan = await prisma.dietPlan.findFirst({
      where: { id: Number(req.params.id), userId: req.user.id },
    });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/plans/:id  (protected)
const deletePlan = async (req, res, next) => {
  try {
    const plan = await prisma.dietPlan.findFirst({
      where: { id: Number(req.params.id), userId: req.user.id },
    });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    await prisma.dietPlan.delete({ where: { id: plan.id } });
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPlan, getPlans, getPlan, deletePlan };
