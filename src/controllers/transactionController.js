const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Ödünç Alma Fonksiyonu
exports.borrowBook = async (req, res) => {
  const { userId, bookId } = req.body;

  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Stoğu kontrol et
      const inventory = await prisma.inventory.findUnique({
        where: { bookId: parseInt(bookId) }
      });

      if (!inventory || inventory.available <= 0) {
        throw new Error("Kitap stoğu tükenmiş!");
      }

      // Kayıt oluştur
      const transaction = await prisma.transaction.create({
        data: {
          userId: parseInt(userId),
          bookId: parseInt(bookId),
          type: "BORROW",
          dueDate: new Date(new Date().setDate(new Date().getDate() + 15))
        }
      });

      // Stoğu azalt
      await prisma.inventory.update({
        where: { bookId: parseInt(bookId) },
        data: { available: { decrement: 1 } }
      });

      return transaction;
    });

    res.status(200).json({ message: "Kitap başarıyla ödünç alındı!", data: result });

  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message || "İşlem başarısız." });
  }
};

// 2. İade Etme Fonksiyonu
exports.returnBook = async (req, res) => {
  const { userId, bookId } = req.body;

  try {
    const result = await prisma.$transaction(async (prisma) => {
      // İade kaydı oluştur
      const transaction = await prisma.transaction.create({
        data: {
          userId: parseInt(userId),
          bookId: parseInt(bookId),
          type: "RETURN",
        }
      });

      // Stoğu artır
      await prisma.inventory.update({
        where: { bookId: parseInt(bookId) },
        data: { available: { increment: 1 } }
      });

      return transaction;
    });

    res.status(200).json({ message: "Kitap iade alındı!", data: result });

  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "İade işlemi başarısız." });
  }
};

// --- EN ALTA EKLE ---

// Tüm İşlem Geçmişini Getir
exports.getAllTransactions = async (req, res) => {
  try {
    const history = await prisma.transaction.findMany({
      include: {
        book: true // Hangi kitap olduğunu da getir (İsmini görmek için)
      },
      orderBy: {
        createdAt: 'desc' // En yeni işlem en üstte görünsün
      }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Geçmiş getirilemedi." });
  }
};