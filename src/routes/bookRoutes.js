const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// --- GET İŞLEMLERİ ---
router.get('/', bookController.getBooks);
router.get('/stats', bookController.getStats);
router.get('/my-books/:userId', bookController.getMyBooks);
router.get('/seed', bookController.seedDatabase);

// --- POST İŞLEMLERİ ---
router.post('/', bookController.createBook);         // Kitap Ekle
router.post('/borrow', bookController.borrowBook);   // Ödünç Al
router.post('/return', bookController.returnBook);   // İade Et

// --- DELETE İŞLEMİ (YENİ EKLENDİ ✅) ---
// Frontend'den gelen ID'ye göre silme fonksiyonunu tetikler
router.delete('/:id', bookController.deleteBook);

module.exports = router;