const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  category: { type: String, enum: ['Makanan', 'Minuman'], required: true }, // Berdasarkan UI filter CNC
  image: { type: String, default: "" } // Menyimpan URL gambar produk sesuai form CRUD Admin
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);