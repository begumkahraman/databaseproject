// Import Prisma Client for database operations
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client
const prisma = new PrismaClient();

// ---------------------------------------------
// 1. BORROW BOOK FUNCTION
// ---------------------------------------------
exports.borrowBook = async (req, res) => {
  const { userId, bookId } = req.body;

  try {
    // Execute borrow logic inside a database transaction
    const result = await prisma.$transaction(async (prisma) => {

      // Check inventory availability for the selected book
      const inventory = await prisma.inventory.findUnique({
        where: { bookId: parseInt(bookId) }
      });

      // If book is not found or no available copies, stop the process
      if (!inventory || inventory.available <= 0) {
        throw new Error("Kitap stoğu tükenmiş!");
      }

      // Create a transaction record for borrowing
      const transaction = await prisma.transaction.create({
        data: {
          userId: parseInt(userId),          // Borrowing user ID
          bookId: parseInt(bookId),          // Borrowed book ID
          type: "BORROW",                    // Transaction type
          dueDate: new Date(
            new Date().setDate(new Date().getDate() + 15)
          )                                  // Due date = today + 15 days
        }
      });

      // Decrease available stock by 1
      await prisma.inventory.update({
        where: { bookId: parseInt(bookId) },
        data: { available: { decrement: 1 } }
      });

      // Return created transaction
      return transaction;
    });

    // Send success response
    res.status(200).json({ 
      message: "Kitap başarıyla ödünç alındı!", 
      data: result 
    });

  } catch (error) {
    // Handle borrowing errors
    console.log(error);
    res.status(400).json({ error: error.message || "İşlem başarısız." });
  }
};

// ---------------------------------------------
// 2. RETURN BOOK FUNCTION
// ---------------------------------------------
exports.returnBook = async (req, res) => {
  const { userId, bookId } = req.body;

  try {
    // Execute return logic inside a database transaction
    const result = await prisma.$transaction(async (prisma) => {

      // Create a transaction record for returning the book
      const transaction = await prisma.transaction.create({
        data: {
          userId: parseInt(userId),  // Returning user ID
          bookId: parseInt(bookId),  // Returned book ID
          type: "RETURN",            // Transaction type
        }
      });

      // Increase available stock by 1
      await prisma.inventory.update({
        where: { bookId: parseInt(bookId) },
        data: { available: { increment: 1 } }
      });

      // Return created transaction
      return transaction;
    });

    // Send success response
    res.status(200).json({ 
      message: "Kitap iade alındı!", 
      data: result 
    });

  } catch (error) {
    // Handle return errors
    console.log(error);
    res.status(400).json({ error: "İade işlemi başarısız." });
  }
};

// ---------------------------------------------
// --- ADD THIS AT THE BOTTOM ---
// ---------------------------------------------

// GET ALL TRANSACTION HISTORY
exports.getAllTransactions = async (req, res) => {
  try {
    // Fetch all transactions with related book information
    const history = await prisma.transaction.findMany({
      include: {
        book: true // Include book details (to show book name)
      },
      orderBy: {
        createdAt: 'desc' // Show newest transactions first
      }
    });

    // Send transaction history
    res.json(history);

  } catch (error) {
    // Handle unexpected errors
    res.status(500).json({ error: "Geçmiş getirilemedi." });
  }
};
