const mongoose = require('mongoose');

const TransactionItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  nameAtTransaction: { type: String, required: true },
  quantity: { type: Number, required: true },
  priceAtTransaction: { type: Number, required: true }
});

const TransactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true }, // Contoh: #131242
  customerName: { type: String, default: 'General Customer' },
  tableNumber: { type: String, default: '-' },
  items: [TransactionItemSchema],
  totalAmount: { type: Number, required: true },
  amountPaid: { type: Number, required: true },
  change: { type: Number, required: true },
  cashierName: { type: String, required: true } // Mencatat kasir yang melayani
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);