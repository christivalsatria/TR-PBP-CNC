// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Hubungkan ke MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Deklarasi Endpoint API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/uploads', express.static('uploads'));

// Root Endpoint
app.get('/', (req, res) => {
  res.send('CNC Cashier API is online and running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server CNC berjalan di port ${PORT}`);
});