const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import middleware keamanan
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

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

// 1. TAMBAH PRODUK (Admin) - upload.single di paling depan
router.post('/', upload.single('image'), verifyToken, verifyAdmin, async (req, res) => {
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

// 2. AMBIL SEMUA PRODUK (Kasir & Admin)
router.get('/', verifyToken, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. AMBIL SATU PRODUK BERDASARKAN ID (Kasir & Admin)
router.get('/:id', verifyToken, async (req, res) => {
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

// 4. EDIT PRODUK (Admin) - upload.single di paling depan
router.put('/:id', upload.single('image'), verifyToken, verifyAdmin, async (req, res) => {
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

// 5. HAPUS PRODUK (Admin)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    // 1. Cari data produk terlebih dahulu untuk mengambil nama file gambarnya
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan!" });
    }

    // 2. Jika produk punya gambar, hapus file gambarnya dari folder 'uploads'
    if (product.image) {
      // Ambil nama filenya saja (misal dari 'uploads/1784361816749.webp' menjadi '1784361816749.webp')
      const imageName = path.basename(product.image); 
      const imagePath = path.join(__dirname, '../uploads', imageName);

      // Cek apakah filenya benar-benar ada di folder sebelum dihapus
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Menghapus file secara permanen
      }
    }

    // 3. Hapus data produk dari database MongoDB
    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Produk dan file gambar berhasil dihapus!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;