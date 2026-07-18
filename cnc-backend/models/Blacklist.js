const mongoose = require('mongoose');

const BlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '1d' // Otomatis terhapus dari database setelah 1 hari (sesuai expiresIn JWT kamu)
  }
});

module.exports = mongoose.model('Blacklist', BlacklistSchema);