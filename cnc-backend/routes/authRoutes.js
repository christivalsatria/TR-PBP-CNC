const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Blacklist = require('../models/Blacklist');

// Register User Baru
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login User (Admin & Kasir)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Username tidak terdaftar/Password Salah' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Username tidak terdaftar/Password Salah' });

    const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: { id: user._id, username: user.username, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout User (Memasukkan token ke Blacklist)
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(400).json({ message: 'Gagal logout, token tidak ditemukan di header.' });
    }

    // Masukkan token ke dalam daftar blacklist
    const blacklistedToken = new Blacklist({ token });
    await blacklistedToken.save();

    res.status(200).json({ message: 'Logout berhasil! Token Anda telah dinonaktifkan oleh server.' });
  } catch (err) {
    // Jika token sudah di-blacklist sebelumnya (duplicate key error)
    if (err.code === 11000) {
      return res.status(200).json({ message: 'Anda sudah logout sebelumnya.' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;