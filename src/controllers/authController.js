// Import Prisma Client for database operations
const { PrismaClient } = require('@prisma/client');

// Library used for hashing and comparing passwords
// We usually use 'bcryptjs' instead of 'bcrypt' to avoid native build issues
const bcrypt = require('bcryptjs');

// JSON Web Token library for authentication
const jwt = require('jsonwebtoken');

// Initialize Prisma client
const prisma = new PrismaClient();

/* ================================
   USER REGISTRATION (REGISTER)
   ================================ */
exports.register = async (req, res) => {

  // Get user data from request body (adminKey comes from frontend)
  const { name, email, password, adminKey } = req.body;

  try {
    // 1. Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- 🍊 ORANGE LOGIC 🍊 ---
    // Default role is "user" (must be lowercase)
    let userRole = "user";

    // If secret admin key is correct, assign admin role
    if (adminKey === "portakal") {
        userRole = "admin"; // IMPORTANT: must be lowercase
    }
    // ---------------------------------

    // 2. Save the user into the database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole // Use the role determined above
      }
    });

    // Send success response with role information
    res.status(201).json({ 
      message: `Kayıt başarılı! Rolünüz: ${userRole === 'admin' ? 'Yönetici 🍊' : 'Üye'}` 
    });
    
  } catch (error) {
    // Log registration error
    console.error("Kayıt hatası:", error);

    // Most likely error: email already exists
    res.status(400).json({ 
      error: "Kayıt olunamadı. Bu email kullanılıyor olabilir." 
    });
  }
};

/* ================================
   USER LOGIN
   ================================ */
exports.login = async (req, res) => {

  // Get login credentials from request body
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    // If user does not exist, return error
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    // 2. Compare entered password with hashed password
    const validPassword = await bcrypt.compare(password, user.password);

    // If password is incorrect, return error
    if (!validPassword) {
      return res.status(401).json({ error: "Şifre hatalı!" });
    }

    // 3. Create JWT token (acts like an identity card)
    const token = jwt.sign(
      { 
        userId: user.id, // Frontend expects userId instead of id
        role: user.role 
      },
      process.env.JWT_SECRET || "gizlisifre",
      { expiresIn: '1d' }
    );

    // 4. Send response data to frontend
    res.json({ 
        message: "Giriş başarılı",
        token,
        role: user.role,     // Used for admin/user checks
        name: user.name,     // For welcome message
        userId: user.id,     // Used in transactions
        userName: user.name  // Ensures compatibility with frontend usage
    });

  } catch (error) {
    // Log login error
    console.error("Giriş hatası:", error);

    // Server error response
    res.status(500).json({ 
      error: "Giriş yapılırken hata oluştu." 
    });
  }
};
