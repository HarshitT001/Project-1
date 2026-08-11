const express = require('express');
const router = express.Router();
const { createPlan, getPlans, getPlan, deletePlan } = require('../controllers/planController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // every route below requires login

router.route('/').post(createPlan).get(getPlans);
router.route('/:id').get(getPlan).delete(deletePlan);

module.exports = router;
