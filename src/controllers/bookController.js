const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'info' },
    { emit: 'stdout', level: 'warn' },
    { emit: 'stdout', level: 'error' },
  ],
});

// 🔥 SQL'leri terminalde yakala
prisma.$on('query', (e) => {
  console.log('\n--- PRISMA SQL ---');
  console.log(e.query);
  console.log('Params:', e.params);
  console.log('Duration:', e.duration, 'ms');
});

// ---------------------------------------------
// 1. KİTAPLARI LİSTELE
// ---------------------------------------------
exports.getBooks = async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      where: { isDeleted: false }, // Silinmemişleri getir
      include: { 
        inventory: true, 
        category: true 
      }
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: "Kitaplar getirilemedi." });
  }
};

// ---------------------------------------------
// 2. YENİ KİTAP EKLE
// ---------------------------------------------
exports.createBook = async (req, res) => {
  const { title, author, isbn, categoryName, publisher, totalQuantity} = req.body;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Kategori kontrolü: Varsa kullan, yoksa yarat
      let category = await prisma.category.findUnique({ where: { name: categoryName } });
      if (!category) {
        category = await prisma.category.create({ data: { name: categoryName } });
      }
      
      const book = await prisma.book.create({
        data: { 
            title, 
            author, 
            isbn,  
            publisher: publisher || "Bilinmiyor", // 👈 Yayınevi eklendi
            categoryId: category.id 
        }
      });
      
      await prisma.inventory.create({
        data: {
          bookId: book.id,
          total: parseInt(totalQuantity),
          available: parseInt(totalQuantity)
        }
      });
      return book;
    });
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Kitap eklenemedi." });
  }
};

// ---------------------------------------------
// 3. İSTATİSTİKLER (RAW SQL İLE)
// ---------------------------------------------
exports.getStats = async (req, res) => {
  try {
    // 1. MSSQL'de "User" ismini [] içine almazsan hata verir.
    // NOT: Silinen kitapları saymasın diye WHERE isDeleted = 0 ekledim.
    const totalBooksResult = await prisma.$queryRaw`SELECT COUNT(*) as count FROM Book WHERE isDeleted = 0`;
    const totalUsersResult = await prisma.$queryRaw`SELECT COUNT(*) as count FROM [User]`;

    console.log("Sorgu Başarılı:", { 
      books: totalBooksResult[0].count, 
      users: totalUsersResult[0].count 
    });

    const users = await prisma.user.findMany({ orderBy: { id: 'desc' } });
    
    // Listede sadece silinmemiş kitaplar görünsün
    const books = await prisma.book.findMany({ where: { isDeleted: false } });

    const transactions = await prisma.transaction.findMany({
      take: 20, 
      orderBy: { createdAt: 'desc' },
      include: { user: true, book: true }
    });

    res.json({ users, books, transactions });
  } catch (error) {
    console.error("Dashboard Hatası Details:", error); 
    res.status(500).json({ error: "İstatistikler çekilemedi." });
  }
};

// ---------------------------------------------
// 3.5 KİTAP SİLME (SOFT DELETE)
// ---------------------------------------------
exports.deleteBook = async (req, res) => {
  const { id } = req.params;
  try {
    // Kitabı tamamen silmek yerine isDeleted=true yapıyoruz
    const deletedBook = await prisma.book.update({
      where: { id: parseInt(id) },
      data: { isDeleted: true }
    });
    res.status(200).json({ message: "Kitap silindi.", book: deletedBook });
  } catch (error) {
    console.error("Silme hatası:", error);
    res.status(500).json({ error: "Kitap silinemedi." });
  }
};

// ---------------------------------------------
// 4. KİTAP ÖDÜNÇ ALMA (GÜVENLİ & SP'Lİ)
// ---------------------------------------------
exports.borrowBook = async (req, res) => {
  const { userId, bookId } = req.body;
  
  const uId = parseInt(userId);
  const bId = parseInt(bookId);

  if (isNaN(uId) || isNaN(bId)) {
    return res.status(400).json({ error: "Geçersiz ID formatı." });
  }

  try {
    // 🔥 ÖDEV ŞARTI: Stored Procedure Çağrısı (GetUserBorrowCount)
    // 1. KONTROL: GENEL LİMİT (Maks 3 kitap)
    const spResult = await prisma.$queryRawUnsafe(`EXEC GetUserBorrowCount @UserId = ${uId}`);
    const activeBorrows = Number(spResult[0]?.activeBorrows || 0);
    
    if (activeBorrows >= 3) {
      return res.status(400).json({ 
        error: `Limit Aşımı! Üzerinizde iade edilmemiş ${activeBorrows} kitap bulunuyor. Limit: 3.` 
      });
    }

    // 🔥 2. KONTROL: AYNI KİTAP ELİNDE VAR MI?
    const alreadyHasIt = await prisma.borrow.findFirst({
      where: {
        userId: uId,
        bookId: bId,
        status: 'BORROWED' // Sadece iade edilmemişlere bak
      }
    });

    if (alreadyHasIt) {
      return res.status(400).json({ 
        error: "Bu kitap zaten şu an elinizde! İkinciyi alamazsınız." 
      });
    }

    // 3. İŞLEM: TRANSACTION (Stok düş, kaydet)
    const result = await prisma.$transaction(async (prisma) => {
      // A) Stok kontrolü
      const inventory = await prisma.inventory.findUnique({ where: { bookId: bId } });
      if (!inventory || inventory.available <= 0) {
        throw new Error("Kitap stokta kalmadı!");
      }

      // B) Stok düşür
      await prisma.inventory.update({
        where: { bookId: bId },
        data: { available: { decrement: 1 } }
      });

      // C) Ödünç kaydı oluştur
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);

      await prisma.borrow.create({
        data: {
          userId: uId,
          bookId: bId,
          dueDate: dueDate
        }
      });

      // D) Hareket kaydı (Log)
      await prisma.transaction.create({
        data: {
          userId: uId,
          bookId: bId,
          type: 'BORROW'
        }
      });

      return { message: "İşlem başarılı, keyifli okumalar! 🌸" };
    });

    res.json(result);

  } catch (error) {
    console.error("Ödünç alma hatası:", error);
    res.status(400).json({ error: error.message || "İşlem başarısız." });
  }
};

// ---------------------------------------------
// 5. ELİMDEKİ KİTAPLAR
// ---------------------------------------------
exports.getMyBooks = async (req, res) => {
  const { userId } = req.params;
  try {
    const borrows = await prisma.borrow.findMany({
      where: {
        userId: parseInt(userId),
        status: 'BORROWED' // Sadece iade edilmemişleri getir
      },
      include: {
        book: true 
      }
    });
    res.json(borrows);
  } catch (error) {
    res.status(500).json({ error: "Kitaplarınız getirilemedi." });
  }
};

// ---------------------------------------------
// 6. KİTAP İADE ETME
// ---------------------------------------------
exports.returnBook = async (req, res) => {
  const { userId, bookId } = req.body;
  const uId = parseInt(userId);
  const bId = parseInt(bookId);

  try {
    const result = await prisma.$transaction(async (prisma) => {
      // A) Bu kitap bu kullanıcıda mı?
      const borrowRecord = await prisma.borrow.findFirst({
        where: {
          userId: uId,
          bookId: bId,
          status: 'BORROWED'
        }
      });

      if (!borrowRecord) {
        throw new Error("İade edilecek aktif bir kayıt bulunamadı.");
      }

      // B) Borcu kapat
      await prisma.borrow.update({
        where: { id: borrowRecord.id },
        data: {
          status: 'RETURNED',
          returnDate: new Date()
        }
      });

      // C) Stoğu artır
      await prisma.inventory.update({
        where: { bookId: bId },
        data: { available: { increment: 1 } }
      });

      // D) Hareket kaydı
      await prisma.transaction.create({
        data: {
          userId: uId,
          bookId: bId,
          type: 'RETURN'
        }
      });

      return { message: "Kitap başarıyla iade edildi." };
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || "İade başarısız." });
  }
};

// ---------------------------------------------
// 7. AKILLI TOHUMLAMA (SEED) 🚀 - GÜNCELLEME DESTEKLİ
// ---------------------------------------------
exports.seedDatabase = async (req, res) => {
  try {
    console.log("🚀 Seed işlemi başladı...");

    // 2. KİTAP LİSTESİ (Senin Gönderdiğin Tam Liste)
    const dummyBooks = [
      // 1. TÜRK KLASİKLERİ
      { title: "Kürk Mantolu Madonna", author: "Sabahattin Ali", isbn: "9789753638029", categoryName: "Türk Klasikleri", publisher: "Yapı Kredi Yayınları" },
      { title: "İnce Memed 1", author: "Yaşar Kemal", isbn: "9789750807088", categoryName: "Türk Klasikleri", publisher: "Yapı Kredi Yayınları" },
      { title: "Tutunamayanlar", author: "Oğuz Atay", isbn: "9789754700114", categoryName: "Türk Klasikleri", publisher: "İletişim Yayınları" },
      { title: "Saatleri Ayarlama Enstitüsü", author: "Ahmet Hamdi Tanpınar", isbn: "9789759955762", categoryName: "Türk Klasikleri", publisher: "Dergah Yayınları" },
      { title: "Çalıkuşu", author: "Reşat Nuri Güntekin", isbn: "9789751026859", categoryName: "Türk Klasikleri", publisher: "İnkılap Kitabevi" },
      { title: "Aylak Adam", author: "Yusuf Atılgan", isbn: "9789753638028", categoryName: "Türk Klasikleri", publisher: "Can Yayınları" },
  
      // 2. DÜNYA KLASİKLERİ
      { title: "1984", author: "George Orwell", isbn: "9789750718533", categoryName: "Dünya Klasikleri", publisher: "Can Yayınları" },
      { title: "Suç ve Ceza", author: "Fyodor Dostoyevski", isbn: "9789750719387", categoryName: "Dünya Klasikleri", publisher: "İş Bankası Yayınları" },
      { title: "Sefiller", author: "Victor Hugo", isbn: "9789750736346", categoryName: "Dünya Klasikleri", publisher: "İş Bankası Yayınları" },
      { title: "Satranç", author: "Stefan Zweig", isbn: "9786053606117", categoryName: "Dünya Klasikleri", publisher: "İş Bankası Yayınları" },
      { title: "Fareler ve İnsanlar", author: "John Steinbeck", isbn: "9789755705859", categoryName: "Dünya Klasikleri", publisher: "Sel Yayıncılık" },
      { title: "Dönüşüm", author: "Franz Kafka", isbn: "9786053609323", categoryName: "Dünya Klasikleri", publisher: "Can Yayınları" },
      { title: "Simyacı", author: "Paulo Coelho", isbn: "9789750726439", categoryName: "Dünya Klasikleri", publisher: "Can Yayınları" },
  
      // 3. BİLİM KURGU & FANTASTİK
      { title: "Yüzüklerin Efendisi", author: "J.R.R. Tolkien", isbn: "9789753420983", categoryName: "Bilim Kurgu & Fantastik", publisher: "Metis Yayıncılık" },
      { title: "Harry Potter ve Felsefe Taşı", author: "J.K. Rowling", isbn: "9789750802946", categoryName: "Bilim Kurgu & Fantastik", publisher: "Yapı Kredi Yayınları" },
      { title: "Dune", author: "Frank Herbert", isbn: "9786053754795", categoryName: "Bilim Kurgu & Fantastik", publisher: "İthaki Yayınları" },
      { title: "Otostopçunun Galaksi Rehberi", author: "Douglas Adams", isbn: "9786053757970", categoryName: "Bilim Kurgu & Fantastik", publisher: "Alfa Yayınları" },
      { title: "Fahrenheit 451", author: "Ray Bradbury", isbn: "9786053757819", categoryName: "Bilim Kurgu & Fantastik", publisher: "İthaki Yayınları" },
  
      // 4. KİŞİSEL GELİŞİM
      { title: "Atomik Alışkanlıklar", author: "James Clear", isbn: "9786257631633", categoryName: "Kişisel Gelişim", publisher: "Pegasus Yayınları" },
      { title: "Ikigai", author: "Hector Garcia", isbn: "9786053111867", categoryName: "Kişisel Gelişim", publisher: "İndigo Kitap" },
      { title: "Zengin Baba Yoksul Baba", author: "Robert T. Kiyosaki", isbn: "9786051061970", categoryName: "Kişisel Gelişim", publisher: "Alfa Yayınları" },
  
      // 5. TARİH & ARAŞTIRMA
      { title: "Nutuk", author: "Mustafa Kemal Atatürk", isbn: "9789751026743", categoryName: "Tarih & Araştırma", publisher: "İnkılap Kitabevi" },
      { title: "Sapiens", author: "Yuval Noah Harari", isbn: "9786054729074", categoryName: "Tarih & Araştırma", publisher: "Kolektif Kitap" },
      { title: "Şu Çılgın Türkler", author: "Turgut Özakman", isbn: "9789752631557", categoryName: "Tarih & Araştırma", publisher: "Bilgi Yayınevi" },
      { title: "İlber Ortaylı Seyahatnamesi", author: "İlber Ortaylı", isbn: "9786050813904", categoryName: "Tarih & Araştırma", publisher: "Kronik Kitap" },
  
      // 6. POLİSİYE & GERİLİM
      { title: "Sherlock Holmes", author: "Arthur Conan Doyle", isbn: "9786051730036", categoryName: "Polisiye & Gerilim", publisher: "Martı Yayınları" },
      { title: "Doğu Ekspresinde Cinayet", author: "Agatha Christie", isbn: "9789752632226", categoryName: "Polisiye & Gerilim", publisher: "Altın Kitaplar" },
      { title: "Da Vinci Şifresi", author: "Dan Brown", isbn: "9789752104235", categoryName: "Polisiye & Gerilim", publisher: "Altın Kitaplar" },
      { title: "Kızıl Nehirler", author: "Jean-Christophe Grange", isbn: "9789759915155", categoryName: "Polisiye & Gerilim", publisher: "Doğan Kitap" },
  
      // 7. ÇOCUK & GENÇLİK
      { title: "Küçük Prens", author: "Antoine de Saint-Exupéry", isbn: "9789750724640", categoryName: "Çocuk & Gençlik", publisher: "Can Çocuk" },
      { title: "Charlie'nin Çikolata Fabrikası", author: "Roald Dahl", isbn: "9789750711312", categoryName: "Çocuk & Gençlik", publisher: "Can Çocuk" },
      { title: "Şeker Portakalı", author: "Jose Mauro de Vasconcelos", isbn: "9789750738609", categoryName: "Çocuk & Gençlik", publisher: "Can Çocuk" },
  
      // 8. ŞİİR
      { title: "Henüz Vakit Varken Gülüm", author: "Nazım Hikmet", isbn: "9789750810620", categoryName: "Şiir", publisher: "Yapı Kredi Yayınları" },
      { title: "Sevda Sözleri", author: "Cemal Süreya", isbn: "9789750801734", categoryName: "Şiir", publisher: "Yapı Kredi Yayınları" },
      { title: "Göğe Bakma Durağı", author: "Turgut Uyar", isbn: "9789750813959", categoryName: "Şiir", publisher: "Yapı Kredi Yayınları" }
    ];

    let addedCount = 0;
    let updatedCount = 0;

    for (const item of dummyBooks) {
      // A) Kategori bul veya yarat
      let category = await prisma.category.findFirst({
        where: { name: item.categoryName }
      });
      if (!category) {
        category = await prisma.category.create({
          data: { name: item.categoryName }
        });
      }

      // B) Kitap kontrolü
      const exists = await prisma.book.findUnique({ where: { isbn: item.isbn } });

      if (!exists) {
        // YOKSA: Yeni Ekle
        await prisma.book.create({
          data: {
            title: item.title,
            author: item.author,
            isbn: item.isbn,
            categoryId: category.id,
            publisher: item.publisher, 
            inventory: { create: { total: 5, available: 5 } }
          }
        });
        console.log(`➕ Eklendi: ${item.title}`);
        addedCount++;
      } else {
        // 🔥 VARSA: Yayınevi bilgisini GÜNCELLE (Burası eklendi!)
        await prisma.book.update({
          where: { id: exists.id },
          data: { 
            publisher: item.publisher, // Listemizdeki doğru yayınevini yaz
            category: { connect: { id: category.id } } 
          }
        });
        console.log(`🔄 Güncellendi: ${item.title}`);
        updatedCount++;
      }
    }
    
    res.json({ message: `İşlem Başarılı! ${addedCount} yeni kitap eklendi, ${updatedCount} mevcut kitap güncellendi. 📚✨` });

  } catch (error) {
    console.error("Seed hatası:", error);
    res.status(500).json({ error: "İşlem başarısız: " + error.message });
  }
};