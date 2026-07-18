const jwt = require('jsonwebtoken');
const Blacklist = require('../models/Blacklist'); // <--- Tambahkan import ini

const verifyToken = async (req, res, next) => { // <--- Tambahkan 'async' di depan (req, res, next)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Akses ditolak! Token tidak ditemukan." });
  }

  try {
    // 1. CEK APAKAH TOKEN SUDAH LOGOUT / MASUK BLACKLIST
    const isBlacklisted = await Blacklist.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({ message: "Akses ditolak! Anda sudah logout, silakan login kembali." });
    }

    // 2. Jika aman, verifikasi JWT seperti biasa
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; 
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