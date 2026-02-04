const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

// Toutes les routes nécessitent l'authentification
router.use(protect);

router.get('/current-month', analyticsController.getCurrentMonthStats);
router.get('/expenses-by-category', analyticsController.getExpensesByCategory);
router.get('/incomes-by-category', analyticsController.getIncomesByCategory);

module.exports = router;
