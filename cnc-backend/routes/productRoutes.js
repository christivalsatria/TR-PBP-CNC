const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. IMPORT MIDDLEWARE KEAMANAN KAMU
// (Sesuaikan '../middleware/authMiddleware' dengan lokasi & nama file milikmu)
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware.js');

// Konfigurasi penyimpanan file gambar
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 2. TAMBAH PRODUK (Kunci: Wajib Login & Harus Admin)
router.post('/', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, price, stock, category } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    const newProduct = new Product({ 
      name, 
      price, 
      stock, 
      category, 
      image: imagePath 
    });

    await newProduct.save();
    res.status(201).json({ message: "Produk berhasil ditambahkan!", data: newProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. AMBIL SEMUA PRODUK (Bebas Akses / Kasir & Admin)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. AMBIL SATU PRODUK BERDASARKAN ID (Bebas Akses / Kasir & Admin)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan!" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. EDIT PRODUK (Kunci: Wajib Login & Harus Admin)
router.put('/:id', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ message: "Produk berhasil diperbarui!", data: updatedProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. HAPUS PRODUK (Kunci: Wajib Login & Harus Admin)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Produk berhasil dihapus!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;