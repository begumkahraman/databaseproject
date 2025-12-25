// Import Express framework
const express = require('express');

// Create a new router instance
const router = express.Router();

// Import transaction controller methods
const transactionController = require('../controllers/transactionController');

// Get full transaction history (borrow & return records)
router.get('/', transactionController.getAllTransactions); // <-- NEWLY ADDED (GET)

// Borrow a book (creates BORROW transaction)
router.post('/borrow', transactionController.borrowBook);

// Return a book (creates RETURN transaction)
router.post('/return', transactionController.returnBook);

// Export router to be used in the main application
module.exports = router;
