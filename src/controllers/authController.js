const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // 'bcrypt' yerine genelde 'bcryptjs' kurmuştuk, hata alırsan burayı kontrol et
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Kullanıcı Kaydı (Register)
exports.register = async (req, res) => {
  // adminKey'i de buradan alıyoruz (Frontend'den gelecek)
  const { name, email, password, adminKey } = req.body;

  try {
    // 1. Şifreyi güvenli hale getir (Hash'le)
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- 🍊 PORTAKAL MANTIĞI 🍊 ---
    // Varsayılan rol "user" (küçük harf!) olsun
    let userRole = "user";

    // Eğer gizli kodu doğru girdiyse rolü "admin" yap
    if (adminKey === "portakal") {
        userRole = "admin"; // DİKKAT: Küçük harf olmalı!
    }
    // ---------------------------------

    // 2. Kullanıcıyı veritabanına kaydet
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole // Yukarıda belirlediğimiz rolü buraya koyduk
      }
    });

    res.status(201).json({ message: `Kayıt başarılı! Rolünüz: ${userRole === 'admin' ? 'Yönetici 🍊' : 'Üye'}` });
    
  } catch (error) {
    console.error("Kayıt hatası:", error);
    // Eğer email zaten varsa hata verir
    res.status(400).json({ error: "Kayıt olunamadı. Bu email kullanılıyor olabilir." });
  }
};

// Kullanıcı Girişi (Login)
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Kullanıcıyı bul
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı." });

    // 2. Şifreyi kontrol et
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: "Şifre hatalı!" });

    // 3. Token oluştur (Kimlik Kartı)
    const token = jwt.sign(
      { userId: user.id, role: user.role }, // Frontend userId beklediği için id değil userId kullandım
      process.env.JWT_SECRET || "gizlisifre", 
      { expiresIn: '1d' }
    );

    // 4. Frontend'e gönderilecek paket
    res.json({ 
        message: "Giriş başarılı", 
        token, 
        role: user.role,     // Frontend kontrolü için şart (admin/user)
        name: user.name,     // Hoşgeldin mesajı için
        userId: user.id,     // İşlemler için
        userName: user.name  // Bazı yerlerde userName kullanmıştık, garanti olsun
    });

  } catch (error) {
    console.error("Giriş hatası:", error);
    res.status(500).json({ error: "Giriş yapılırken hata oluştu." });
  }
};