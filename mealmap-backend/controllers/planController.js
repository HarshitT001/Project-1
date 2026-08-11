const DietPlan = require('../models/DietPlan');

// @route  POST /api/plans  (protected)
const createPlan = async (req, res, next) => {
  try {
    const plan = await DietPlan.create({ ...req.body, user: req.user._id });
    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/plans  (protected) — only this user's plans
const getPlans = async (req, res, next) => {
  try {
    const plans = await DietPlan.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/plans/:id  (protected)
const getPlan = async (req, res, next) => {
  try {
    const plan = await DietPlan.findOne({ _id: req.params.id, user: req.user._id });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/plans/:id  (protected)
const deletePlan = async (req, res, next) => {
  try {
    const plan = await DietPlan.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPlan, getPlans, getPlan, deletePlan };
