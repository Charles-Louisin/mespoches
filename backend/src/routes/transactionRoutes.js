const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

// Toutes les routes nécessitent l'authentification
router.use(protect);

router.post('/income', transactionController.createIncome);
router.post('/expense', transactionController.createExpense);
router.post('/transfer', transactionController.createTransfer);
router.get('/', transactionController.getAllTransactions);
router.get('/:id', transactionController.getTransactionById);

module.exports = router;
