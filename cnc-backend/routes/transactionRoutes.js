const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// 1. Skenario Memproses Pembayaran (Checkout)
router.post('/checkout', verifyToken, async (req, res) => {
  try {
    const { customerName, tableNumber, items, amountPaid, cashierName } = req.body;
    // items format: [{ productId: "id", quantity: 2 }]

    let totalAmount = 0;
    const transactionItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Produk ID ${item.productId} tidak ditemukan` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Stok ${product.name} tidak mencukupi!` });
      }

      // Potong stok produk
      product.stock -= item.quantity;
      await product.save();

      const subTotal = product.price * item.quantity;
      totalAmount += subTotal;

      transactionItems.push({
        product: product._id,
        nameAtTransaction: product.name,
        quantity: item.quantity,
        priceAtTransaction: product.price
      });
    }

    if (amountPaid < totalAmount) {
      return res.status(400).json({ message: 'Uang pembayaran tunai kurang!' });
    }

    const change = amountPaid - totalAmount;
    
    // Generate nomor invoice transaksi unik secara acak
    const transactionId = "RTL-" + Math.floor(100000 + Math.random() * 900000);

    const newTransaction = new Transaction({
      transactionId,
      customerName,
      tableNumber,
      items: transactionItems,
      totalAmount,
      amountPaid,
      change,
      cashierName
    });

    await newTransaction.save();
    res.status(201).json({
      message: 'Pembayaran Sukses!',
      data: newTransaction
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Ambil Riwayat Transaksi (Kasir & Laporan Keuangan Admin)
router.get('/history', verifyToken, async (req, res) => {
  try {
    const history = await Transaction.find().sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Rekap Pendapatan per Minggu (Khusus Admin)
router.get('/summary-weekly', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const weeklySummary = await Transaction.aggregate([
      {
        $group: {
          // Mengelompokkan berdasarkan tahun dan minggu ke-berapa dalam tahun tersebut
          _id: {
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" }
          },
          // Menghitung total omzet pada minggu tersebut
          totalRevenue: { $sum: "$totalAmount" },
          // Menghitung jumlah transaksi yang terjadi pada minggu tersebut
          totalTransactions: { $sum: 1 }
        }
      },
      {
        // Mengurutkan dari minggu terbaru
        $sort: { "_id.year": -1, "_id.week": -1 }
      }
    ]);

    res.json({
      message: "Rekap pendapatan mingguan berhasil diambil",
      data: weeklySummary
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;