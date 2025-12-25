const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 1. Rotaları Çağır
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const transactionRoutes = require('./routes/transactionRoutes'); 

// 2. Ayarları Yükle
dotenv.config();

// 3. Uygulamayı Başlat
const app = express();

// 4. İzinler (CORS & JSON)
app.use(cors()); // ✅ KAPILARI AÇAN SİHİRLİ SATIR
app.use(express.json());

// 5. Rotaları Tanımla
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/transactions', transactionRoutes);

// Test
app.get('/', (req, res) => res.send('Sunucu aktif! 🚀'));

// 6. Başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Sunucu ${PORT} portunda çalışıyor...`));