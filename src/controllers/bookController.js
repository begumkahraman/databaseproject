// Import Prisma Client for database access
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma with detailed logging configuration
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },  // Capture SQL queries as events
    { emit: 'stdout', level: 'info' },  // Log informational messages
    { emit: 'stdout', level: 'warn' },  // Log warnings
    { emit: 'stdout', level: 'error' }, // Log errors
  ],
});

// 🔥 Capture and print executed SQL queries in the terminal
prisma.$on('query', (e) => {
  console.log('\n--- PRISMA SQL ---');
  console.log(e.query);          // Executed SQL query
  console.log('Params:', e.params); // Query parameters
  console.log('Duration:', e.duration, 'ms'); // Execution time
});

// ---------------------------------------------
// 1. LIST ALL BOOKS
// ---------------------------------------------
exports.getBooks = async (req, res) => {
  try {
    // Fetch all non-deleted books with inventory and category info
    const books = await prisma.book.findMany({
      where: { isDeleted: false }, // Only bring non-deleted books
      include: { 
        inventory: true, 
        category: true 
      }
    });

    // Send book list to client
    res.json(books);
  } catch (error) {
    // Handle unexpected errors
    res.status(500).json({ error: "Kitaplar getirilemedi." });
  }
};

// ---------------------------------------------
// 2. CREATE A NEW BOOK
// ---------------------------------------------
exports.createBook = async (req, res) => {
  const { title, author, isbn, categoryName, publisher, totalQuantity } = req.body;

  try {
    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (prisma) => {

      // Check if category exists, create it if not
      let category = await prisma.category.findUnique({ 
        where: { name: categoryName } 
      });

      if (!category) {
        category = await prisma.category.create({ 
          data: { name: categoryName } 
        });
      }
      
      // Create book record
      const book = await prisma.book.create({
        data: { 
            title, 
            author, 
            isbn,  
            publisher: publisher || "Bilinmiyor", // Default publisher if not provided
            categoryId: category.id 
        }
      });
      
      // Create inventory record for the book
      await prisma.inventory.create({
        data: {
          bookId: book.id,
          total: parseInt(totalQuantity),
          available: parseInt(totalQuantity)
        }
      });

      // Return created book
      return book;
    });

    // Respond with created book
    res.status(201).json(result);

  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Kitap eklenemedi." });
  }
};

// ---------------------------------------------
// 3. STATISTICS (USING RAW SQL)
// ---------------------------------------------
exports.getStats = async (req, res) => {
  try {
    // MSSQL requires [User] instead of User as table name
    // Also exclude soft-deleted books
    const totalBooksResult = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM Book WHERE isDeleted = 0
    `;
    const totalUsersResult = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM [User]
    `;

    // Log query results
    console.log("Query Success:", { 
      books: totalBooksResult[0].count, 
      users: totalUsersResult[0].count 
    });

    // Fetch all users
    const users = await prisma.user.findMany({ 
      orderBy: { id: 'desc' } 
    });
    
    // Fetch only non-deleted books
    const books = await prisma.book.findMany({ 
      where: { isDeleted: false } 
    });

    // Fetch latest transactions
    const transactions = await prisma.transaction.findMany({
      take: 20, 
      orderBy: { createdAt: 'desc' },
      include: { user: true, book: true }
    });

    // Send dashboard data
    res.json({ users, books, transactions });

  } catch (error) {
    console.error("Dashboard Error Details:", error); 
    res.status(500).json({ error: "İstatistikler çekilemedi." });
  }
};

// ---------------------------------------------
// 3.5 DELETE BOOK (SOFT DELETE)
// ---------------------------------------------
exports.deleteBook = async (req, res) => {
  const { id } = req.params;

  try {
    // Soft delete: mark book as deleted instead of removing it
    const deletedBook = await prisma.book.update({
      where: { id: parseInt(id) },
      data: { isDeleted: true }
    });

    // Send success response
    res.status(200).json({ 
      message: "Kitap silindi.", 
      book: deletedBook 
    });

  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Kitap silinemedi." });
  }
};

// ---------------------------------------------
// 4. BORROW BOOK (SECURE & STORED PROCEDURE BASED)
// ---------------------------------------------
exports.borrowBook = async (req, res) => {
  const { userId, bookId } = req.body;
  
  // Convert IDs to integers
  const uId = parseInt(userId);
  const bId = parseInt(bookId);

  // Validate ID formats
  if (isNaN(uId) || isNaN(bId)) {
    return res.status(400).json({ error: "Geçersiz ID formatı." });
  }

  try {
    // 🔥 ASSIGNMENT REQUIREMENT:
    // Call Stored Procedure (GetUserBorrowCount)

    // 1. GLOBAL LIMIT CHECK (Max 3 active borrows)
    const spResult = await prisma.$queryRawUnsafe(
      `EXEC GetUserBorrowCount @UserId = ${uId}`
    );

    // Extract active borrow count
    const activeBorrows = Number(spResult[0]?.activeBorrows || 0);
    
    // If limit exceeded, block borrowing
    if (activeBorrows >= 3) {
      return res.status(400).json({ 
        error: `Limit Aşımı! Üzerinizde iade edilmemiş ${activeBorrows} kitap bulunuyor. Limit: 3.` 
      });
    }

     // 🔥 2. CHECK: DOES THE USER ALREADY HAVE THIS BOOK?
    const alreadyHasIt = await prisma.borrow.findFirst({
      where: {
        userId: uId,              // Current user ID
        bookId: bId,              // Selected book ID
        status: 'BORROWED'        // Only check non-returned books
      }
    });

    // If the user already borrowed this book, block the action
    if (alreadyHasIt) {
      return res.status(400).json({ 
        error: "Bu kitap zaten şu an elinizde! İkinciyi alamazsınız." 
      });
    }

    // 3. MAIN OPERATION: TRANSACTION (Decrease stock & save records)
    const result = await prisma.$transaction(async (prisma) => {

      // A) INVENTORY CHECK
      const inventory = await prisma.inventory.findUnique({ 
        where: { bookId: bId } 
      });

      // If book does not exist in inventory or stock is empty
      if (!inventory || inventory.available <= 0) {
        throw new Error("Kitap stokta kalmadı!");
      }

      // B) DECREASE AVAILABLE STOCK BY 1
      await prisma.inventory.update({
        where: { bookId: bId },
        data: { available: { decrement: 1 } }
      });

      // C) CREATE BORROW RECORD
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15); // Due date = today + 15 days

      await prisma.borrow.create({
        data: {
          userId: uId,
          bookId: bId,
          dueDate: dueDate
        }
      });

      // D) CREATE TRANSACTION LOG (BORROW)
      await prisma.transaction.create({
        data: {
          userId: uId,
          bookId: bId,
          type: 'BORROW'
        }
      });

      // Return success message if all operations succeed
      return { message: "İşlem başarılı, keyifli okumalar! 🌸" };
    });

    // Send successful transaction response
    res.json(result);

  } catch (error) {
    // Catch and log borrowing errors
    console.error("Ödünç alma hatası:", error);
    res.status(400).json({ 
      error: error.message || "İşlem başarısız." 
    });
  }
};

// ---------------------------------------------
// 5. GET MY BORROWED BOOKS
// ---------------------------------------------
exports.getMyBooks = async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch all active (not returned) borrow records for the user
    const borrows = await prisma.borrow.findMany({
      where: {
        userId: parseInt(userId), // Convert userId to integer
        status: 'BORROWED'        // Only non-returned books
      },
      include: {
        book: true                // Include related book details
      }
    });

    // Send borrowed books list
    res.json(borrows);

  } catch (error) {
    // Handle unexpected errors
    res.status(500).json({ error: "Kitaplarınız getirilemedi." });
  }
};

// ---------------------------------------------
// 6. RETURN BOOK
// ---------------------------------------------
exports.returnBook = async (req, res) => {
  const { userId, bookId } = req.body;

  // Convert incoming IDs to integers
  const uId = parseInt(userId);
  const bId = parseInt(bookId);

  try {
    // Execute all return operations inside a transaction
    const result = await prisma.$transaction(async (prisma) => {

      // A) CHECK: Does this user currently have this book borrowed?
      const borrowRecord = await prisma.borrow.findFirst({
        where: {
          userId: uId,
          bookId: bId,
          status: 'BORROWED' // Only active (not returned) borrows
        }
      });

      // If no active borrow record is found, stop the process
      if (!borrowRecord) {
        throw new Error("İade edilecek aktif bir kayıt bulunamadı.");
      }

      // B) CLOSE THE BORROW RECORD
      await prisma.borrow.update({
        where: { id: borrowRecord.id },
        data: {
          status: 'RETURNED',     // Mark as returned
          returnDate: new Date()  // Save return timestamp
        }
      });

      // C) INCREASE AVAILABLE STOCK BY 1
      await prisma.inventory.update({
        where: { bookId: bId },
        data: { available: { increment: 1 } }
      });

      // D) CREATE TRANSACTION LOG (RETURN)
      await prisma.transaction.create({
        data: {
          userId: uId,
          bookId: bId,
          type: 'RETURN'
        }
      });

      // Return success message if all steps succeed
      return { message: "Kitap başarıyla iade edildi." };
    });

    // Send transaction result to client
    res.json(result);

  } catch (error) {
    // Log return errors and send response
    console.error(error);
    res.status(400).json({ error: error.message || "İade başarısız." });
  }
};

// ---------------------------------------------
// 7. SMART SEEDING 🚀 (UPDATE-SAFE)
// ---------------------------------------------
exports.seedDatabase = async (req, res) => {
  try {
    console.log("🚀 Seed işlemi başladı...");

    // 2. BOOK LIST (FULL PREDEFINED DATASET)
    const dummyBooks = [
      // 1. TURKISH CLASSICS
      { title: "Kürk Mantolu Madonna", author: "Sabahattin Ali", isbn: "9789753638029", categoryName: "Türk Klasikleri", publisher: "Yapı Kredi Yayınları" },
      { title: "İnce Memed 1", author: "Yaşar Kemal", isbn: "9789750807088", categoryName: "Türk Klasikleri", publisher: "Yapı Kredi Yayınları" },
      { title: "Tutunamayanlar", author: "Oğuz Atay", isbn: "9789754700114", categoryName: "Türk Klasikleri", publisher: "İletişim Yayınları" },
      { title: "Saatleri Ayarlama Enstitüsü", author: "Ahmet Hamdi Tanpınar", isbn: "9789759955762", categoryName: "Türk Klasikleri", publisher: "Dergah Yayınları" },
      { title: "Çalıkuşu", author: "Reşat Nuri Güntekin", isbn: "9789751026859", categoryName: "Türk Klasikleri", publisher: "İnkılap Kitabevi" },
      { title: "Aylak Adam", author: "Yusuf Atılgan", isbn: "9789753638028", categoryName: "Türk Klasikleri", publisher: "Can Yayınları" },

      // 2. WORLD CLASSICS
      { title: "1984", author: "George Orwell", isbn: "9789750718533", categoryName: "Dünya Klasikleri", publisher: "Can Yayınları" },
      { title: "Suç ve Ceza", author: "Fyodor Dostoyevski", isbn: "9789750719387", categoryName: "Dünya Klasikleri", publisher: "İş Bankası Yayınları" },
      { title: "Sefiller", author: "Victor Hugo", isbn: "9789750736346", categoryName: "Dünya Klasikleri", publisher: "İş Bankası Yayınları" },
      { title: "Satranç", author: "Stefan Zweig", isbn: "9786053606117", categoryName: "Dünya Klasikleri", publisher: "İş Bankası Yayınları" },
      { title: "Fareler ve İnsanlar", author: "John Steinbeck", isbn: "9789755705859", categoryName: "Dünya Klasikleri", publisher: "Sel Yayıncılık" },
      { title: "Dönüşüm", author: "Franz Kafka", isbn: "9786053609323", categoryName: "Dünya Klasikleri", publisher: "Can Yayınları" },
      { title: "Simyacı", author: "Paulo Coelho", isbn: "9789750726439", categoryName: "Dünya Klasikleri", publisher: "Can Yayınları" },

      // 3. SCIENCE FICTION & FANTASY
      { title: "Yüzüklerin Efendisi", author: "J.R.R. Tolkien", isbn: "9789753420983", categoryName: "Bilim Kurgu & Fantastik", publisher: "Metis Yayıncılık" },
      { title: "Harry Potter ve Felsefe Taşı", author: "J.K. Rowling", isbn: "9789750802946", categoryName: "Bilim Kurgu & Fantastik", publisher: "Yapı Kredi Yayınları" },
      { title: "Dune", author: "Frank Herbert", isbn: "9786053754795", categoryName: "Bilim Kurgu & Fantastik", publisher: "İthaki Yayınları" },
      { title: "Otostopçunun Galaksi Rehberi", author: "Douglas Adams", isbn: "9786053757970", categoryName: "Bilim Kurgu & Fantastik", publisher: "Alfa Yayınları" },
      { title: "Fahrenheit 451", author: "Ray Bradbury", isbn: "9786053757819", categoryName: "Bilim Kurgu & Fantastik", publisher: "İthaki Yayınları" },

      // 4. PERSONAL DEVELOPMENT
      { title: "Atomik Alışkanlıklar", author: "James Clear", isbn: "9786257631633", categoryName: "Kişisel Gelişim", publisher: "Pegasus Yayınları" },
      { title: "Ikigai", author: "Hector Garcia", isbn: "9786053111867", categoryName: "Kişisel Gelişim", publisher: "İndigo Kitap" },
      { title: "Zengin Baba Yoksul Baba", author: "Robert T. Kiyosaki", isbn: "9786051061970", categoryName: "Kişisel Gelişim", publisher: "Alfa Yayınları" },

      // 5. HISTORY & RESEARCH
      { title: "Nutuk", author: "Mustafa Kemal Atatürk", isbn: "9789751026743", categoryName: "Tarih & Araştırma", publisher: "İnkılap Kitabevi" },
      { title: "Sapiens", author: "Yuval Noah Harari", isbn: "9786054729074", categoryName: "Tarih & Araştırma", publisher: "Kolektif Kitap" },
      { title: "Şu Çılgın Türkler", author: "Turgut Özakman", isbn: "9789752631557", categoryName: "Tarih & Araştırma", publisher: "Bilgi Yayınevi" },
      { title: "İlber Ortaylı Seyahatnamesi", author: "İlber Ortaylı", isbn: "9786050813904", categoryName: "Tarih & Araştırma", publisher: "Kronik Kitap" },

      // 6. CRIME & THRILLER
      { title: "Sherlock Holmes", author: "Arthur Conan Doyle", isbn: "9786051730036", categoryName: "Polisiye & Gerilim", publisher: "Martı Yayınları" },
      { title: "Doğu Ekspresinde Cinayet", author: "Agatha Christie", isbn: "9789752632226", categoryName: "Polisiye & Gerilim", publisher: "Altın Kitaplar" },
      { title: "Da Vinci Şifresi", author: "Dan Brown", isbn: "9789752104235", categoryName: "Polisiye & Gerilim", publisher: "Altın Kitaplar" },
      { title: "Kızıl Nehirler", author: "Jean-Christophe Grange", isbn: "9789759915155", categoryName: "Polisiye & Gerilim", publisher: "Doğan Kitap" },

      // 7. CHILDREN & YOUTH
      { title: "Küçük Prens", author: "Antoine de Saint-Exupéry", isbn: "9789750724640", categoryName: "Çocuk & Gençlik", publisher: "Can Çocuk" },
      { title: "Charlie'nin Çikolata Fabrikası", author: "Roald Dahl", isbn: "9789750711312", categoryName: "Çocuk & Gençlik", publisher: "Can Çocuk" },
      { title: "Şeker Portakalı", author: "Jose Mauro de Vasconcelos", isbn: "9789750738609", categoryName: "Çocuk & Gençlik", publisher: "Can Çocuk" },

      // 8. POETRY
      { title: "Henüz Vakit Varken Gülüm", author: "Nazım Hikmet", isbn: "9789750810620", categoryName: "Şiir", publisher: "Yapı Kredi Yayınları" },
      { title: "Sevda Sözleri", author: "Cemal Süreya", isbn: "9789750801734", categoryName: "Şiir", publisher: "Yapı Kredi Yayınları" },
      { title: "Göğe Bakma Durağı", author: "Turgut Uyar", isbn: "9789750813959", categoryName: "Şiir", publisher: "Yapı Kredi Yayınları" }
    ];

    // Counters for reporting results
    let addedCount = 0;
    let updatedCount = 0;

    // Loop through all seed books
    for (const item of dummyBooks) {

      // A) FIND OR CREATE CATEGORY
      let category = await prisma.category.findFirst({
        where: { name: item.categoryName }
      });

      if (!category) {
        category = await prisma.category.create({
          data: { name: item.categoryName }
        });
      }


      // B) BOOK EXISTENCE CHECK (by ISBN)
      const exists = await prisma.book.findUnique({ 
        where: { isbn: item.isbn } 
      });

      if (!exists) {
        // IF NOT EXISTS: CREATE NEW BOOK WITH INVENTORY
        await prisma.book.create({
          data: {
            title: item.title,
            author: item.author,
            isbn: item.isbn,
            categoryId: category.id,
            publisher: item.publisher, 
            inventory: { 
              create: { total: 5, available: 5 } // Initial stock values
            }
          }
        });

        // Log newly added book
        console.log(`➕ Eklendi: ${item.title}`);
        addedCount++;

      } else {
        // 🔥 IF EXISTS: UPDATE PUBLISHER & CATEGORY (NEW LOGIC)
        await prisma.book.update({
          where: { id: exists.id },
          data: { 
            publisher: item.publisher, // Update publisher from seed list
            category: { connect: { id: category.id } } // Ensure correct category link
          }
        });

        // Log updated book
        console.log(`🔄 Güncellendi: ${item.title}`);
        updatedCount++;
      }
    }
    
    // Send final seed operation summary
    res.json({ 
      message: `İşlem Başarılı! ${addedCount} yeni kitap eklendi, ${updatedCount} mevcut kitap güncellendi. 📚✨` 
    });

  } catch (error) {
    // Handle and log seeding errors
    console.error("Seed hatası:", error);
    res.status(500).json({ error: "İşlem başarısız: " + error.message });
  }

};
