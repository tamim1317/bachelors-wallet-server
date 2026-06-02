const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/meals', require('./routes/mealRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/bills', require('./routes/billRoutes'));
app.use('/api/income', require('./routes/incomeRoutes'));
app.use('/api/settlement', require('./routes/settlementRoutes'));
app.use('/api/mess', require('./routes/messRoutes'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🎓 Bachelor Mess API Running!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
