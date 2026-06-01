const Income = require('../models/Income');
const Expense = require('../models/Expense');

// মাসের সব income দেখো
exports.getIncomes = async (req, res) => {
  try {
    const { month } = req.query;
    const filter = month ? { month } : {};
    const incomes = await Income.find(filter).sort({ date: -1 });
    const total = incomes.reduce((sum, i) => sum + i.amount, 0);
    res.json({ success: true, data: incomes, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// নতুন income যোগ করো
exports.createIncome = async (req, res) => {
  try {
    const income = await Income.create(req.body);
    res.status(201).json({ success: true, data: income });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// income delete করো
exports.deleteIncome = async (req, res) => {
  try {
    await Income.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'মুছে ফেলা হয়েছে' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// মাসের income vs expense summary
exports.getMonthlySummary = async (req, res) => {
  try {
    const { month } = req.params;
    const [year, m] = month.split('-');
    const startDate = new Date(year, m - 1, 1);
    const endDate   = new Date(year, m, 0, 23, 59, 59);

    const incomes  = await Income.find({ month });
    const expenses = await Expense.find({
      date: { $gte: startDate, $lte: endDate }
    });

    const totalIncome  = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const savings      = totalIncome - totalExpense;
    const savingsRate  = totalIncome > 0
      ? +((savings / totalIncome) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: { totalIncome, totalExpense, savings, savingsRate, month }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};