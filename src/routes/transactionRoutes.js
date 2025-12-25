const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.get('/', transactionController.getAllTransactions); // <-- YENİ EKLENEN (GET)
router.post('/borrow', transactionController.borrowBook);
router.post('/return', transactionController.returnBook);

module.exports = router;