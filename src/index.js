// Express setup
const express = require('express');

// Middlewares
const cors = require('cors');
const dotenv = require('dotenv');

// Route files
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// Load environment variables
dotenv.config();

// Create app
const app = express();

// Global middlewares
app.use(cors());          // Enable CORS
app.use(express.json());  // Parse JSON bodies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/transactions', transactionRoutes);

// Test route
app.get('/', (req, res) => res.send('Sunucu aktif! 🚀'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
