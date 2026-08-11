const express = require('express');
const router = express.Router();
const { addLog, getLogs } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').post(addLog).get(getLogs);

module.exports = router;
