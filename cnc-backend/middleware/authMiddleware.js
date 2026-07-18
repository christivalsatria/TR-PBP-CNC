const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Mengambil token dari header Authorization (Bearer <TOKEN>)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Akses ditolak! Token tidak ditemukan." });
  }

  try {
    // SINKRONISASI: Harus sama persis menggunakan process.env.JWT_SECRET seperti di authRoutes
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Menyimpan data token (id, role, username) ke req.user
    next(); 
  } catch (err) {
    return res.status(403).json({ message: "Token tidak valid atau telah kedaluwarsa." });
  }
};

const verifyAdmin = (req, res, next) => {
  // Di authRoutes kamu menyimpan role user sesuai input register (contoh: 'Admin' atau 'Kasir')
  if (req.user && (req.user.role === 'Admin' || req.user.role === 'admin')) {
    next(); 
  } else {
    return res.status(403).json({ message: "Akses ditolak! Khusus untuk peran Admin." });
  }
};

module.exports = { verifyToken, verifyAdmin };