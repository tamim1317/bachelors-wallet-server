const Budget  = require('../models/Budget');
const Expense = require('../models/Expense');

// মাসের budget দেখো
exports.getBudget = async (req, res) => {
  try {
    const { month } = req.params;
    const budget = await Budget.findOne({ month });
    res.json({ success: true, data: budget });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Budget set করো
exports.setBudget = async (req, res) => {
  try {
    const { month } = req.params;
    const budget = await Budget.findOneAndUpdate(
      { month },
      req.body,
      { upsert: true, new: true }
    );
    res.json({ success: true, data: budget });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Budget vs actual spending check করো
exports.getBudgetStatus = async (req, res) => {
  try {
    const { month } = req.params;
    const [year, m] = month.split('-');
    const startDate = new Date(year, m - 1, 1);
    const endDate   = new Date(year, m, 0, 23, 59, 59);

    const budget   = await Budget.findOne({ month });
    const expenses = await Expense.find({
      date: { $gte: startDate, $lte: endDate }
    });

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Category wise spending
    const catSpending = {};
    expenses.forEach(e => {
      catSpending[e.category] = (catSpending[e.category] || 0) + e.amount;
    });

    let alerts = [];
    let status = 'safe'; // safe, warning, danger

    if (budget) {
      const percentage = (totalSpent / budget.totalBudget) * 100;

      if (percentage >= 100) {
        status = 'danger';
        alerts.push({
          type: 'danger',
          message: `⚠️ Budget শেষ! মোট budget ৳${budget.totalBudget} এর বিপরীতে ৳${totalSpent} খরচ হয়েছে`
        });
      } else if (percentage >= 80) {
        status = 'warning';
        alerts.push({
          type: 'warning',
          message: `🔔 Budget এর ${percentage.toFixed(0)}% খরচ হয়ে গেছে! সাবধান থাকুন`
        });
      }

      // Category alerts
      budget.categories?.forEach(cat => {
        const spent = catSpending[cat.name] || 0;
        const catPct = (spent / cat.limit) * 100;
        if (catPct >= 100) {
          alerts.push({
            type: 'danger',
            message: `❌ "${cat.name}" এর budget শেষ! (৳${spent}/৳${cat.limit})`
          });
        } else if (catPct >= 80) {
          alerts.push({
            type: 'warning',
            message: `⚡ "${cat.name}" এর ${catPct.toFixed(0)}% budget শেষ (৳${spent}/৳${cat.limit})`
          });
        }
      });
    }

    res.json({
      success: true,
      data: {
        budget,
        totalSpent,
        status,
        alerts,
        percentage: budget ? +((totalSpent / budget.totalBudget) * 100).toFixed(1) : 0,
        remaining:  budget ? budget.totalBudget - totalSpent : 0,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};