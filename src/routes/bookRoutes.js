// Import Express framework
const express = require('express');

// Create a new router instance
const router = express.Router();

// Import book controller methods
const bookController = require('../controllers/bookController');

// ---------------------------------------------
// GET REQUESTS
// ---------------------------------------------

// Get all books (non-deleted)
router.get('/', bookController.getBooks);

// Get dashboard statistics (users, books, transactions)
router.get('/stats', bookController.getStats);

// Get currently borrowed books for a specific user
router.get('/my-books/:userId', bookController.getMyBooks);

// Seed database with predefined book data
router.get('/seed', bookController.seedDatabase);

// ---------------------------------------------
// POST REQUESTS
// ---------------------------------------------

// Create a new book
router.post('/', bookController.createBook);

// Borrow a book
router.post('/borrow', bookController.borrowBook);

// Return a borrowed book
router.post('/return', bookController.returnBook);

// ---------------------------------------------
// DELETE REQUEST (NEWLY ADDED ✅)
// ---------------------------------------------

// Trigger soft delete operation based on book ID from frontend
router.delete('/:id', bookController.deleteBook);

// Export router to be used in the main app
module.exports = router;
