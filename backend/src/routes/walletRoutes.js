const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { protect } = require('../middleware/auth');

// Toutes les routes nécessitent l'authentification
router.use(protect);

router.post('/', walletController.createWallet);
router.get('/', walletController.getAllWallets);
router.get('/total-balance', walletController.getTotalBalance);
router.get('/:id', walletController.getWalletById);
router.put('/:id', walletController.updateWallet);
router.delete('/:id', walletController.deleteWallet);
router.get('/:id/history', walletController.getWalletHistory);

module.exports = router;
