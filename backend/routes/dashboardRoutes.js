const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

router.get('/summary', dashboardController.summary);
router.get('/category-summary', dashboardController.categorySummary);
router.get('/monthly-summary', dashboardController.monthlySummary);
router.get('/insights', dashboardController.insights);

module.exports = router;
