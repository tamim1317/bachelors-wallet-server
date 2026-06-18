const Expense = require('../models/Expense');

// সব expense দেখো (filter সহ)
exports.getExpenses = async (req, res) => {
  try {
    const { type, month, year } = req.query;
    let filter = {};

    if (type) filter.type = type;
    if (month && year) {
      filter.date = {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0, 23, 59, 59)
      };
    }

    const expenses = await Expense.find(filter)
      .populate('memberId', 'name')
      .sort({ date: -1 });

    // মোট হিসাব
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    res.json({ success: true, data: expenses, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// নতুন expense যোগ করো
exports.createExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);

    // 🔴 Real-time broadcast
    if (global.io) {
      global.io.emit('expense:created', {
        type:     expense.type,
        amount:   expense.amount,
        category: expense.category,
      });
    }

    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// expense delete করো
exports.deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'মুছে ফেলা হয়েছে' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// মাসের mess expense summary
exports.getMessExpenseSummary = async (req, res) => {
  try {
    const { year, month } = req.params;
    const expenses = await Expense.find({
      type: 'mess',
      date: {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0, 23, 59, 59)
      }
    });
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    res.json({ success: true, data: expenses, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
