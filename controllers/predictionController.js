const Expense = require('../models/Expense');
const Income  = require('../models/Income');

exports.getPrediction = async (req, res) => {
  try {
    const now   = new Date();
    const year  = now.getFullYear();
    const month = now.getMonth() + 1;

    // গত ৩ মাসের data নিয়ে average বের করো
    const monthlyData = [];

    for (let i = 3; i >= 1; i--) {
      let m = month - i;
      let y = year;
      if (m <= 0) { m += 12; y -= 1; }

      const startDate = new Date(y, m - 1, 1);
      const endDate   = new Date(y, m, 0, 23, 59, 59);

      const expenses = await Expense.find({
        date: { $gte: startDate, $lte: endDate }
      });

      const incomes = await Income.find({
        month: `${y}-${String(m).padStart(2, '0')}`
      });

      const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
      const totalIncome  = incomes.reduce((sum, i) => sum + i.amount, 0);

      // Category wise breakdown
      const catBreakdown = {};
      expenses.forEach(e => {
        catBreakdown[e.category] = (catBreakdown[e.category] || 0) + e.amount;
      });

      monthlyData.push({
        month: `${y}-${String(m).padStart(2, '0')}`,
        totalExpense,
        totalIncome,
        catBreakdown
      });
    }

    // Average calculate করো
    const avgExpense = monthlyData.reduce((sum, d) => sum + d.totalExpense, 0) / monthlyData.length;
    const avgIncome  = monthlyData.reduce((sum, d) => sum + d.totalIncome, 0)  / monthlyData.length;

    // Trend বের করো (বাড়ছে না কমছে)
    const trend = monthlyData.length >= 2
      ? monthlyData[monthlyData.length - 1].totalExpense - monthlyData[0].totalExpense
      : 0;

    const trendPct = monthlyData[0]?.totalExpense > 0
      ? +((trend / monthlyData[0].totalExpense) * 100).toFixed(1)
      : 0;

    // Next month prediction
    const predicted = +(avgExpense * (1 + trendPct / 100 / 3)).toFixed(2);

    // Category predictions
    const allCats = {};
    monthlyData.forEach(d => {
      Object.entries(d.catBreakdown).forEach(([cat, amt]) => {
        if (!allCats[cat]) allCats[cat] = [];
        allCats[cat].push(amt);
      });
    });

    const catPredictions = Object.entries(allCats).map(([cat, amounts]) => ({
      category: cat,
      predicted: +(amounts.reduce((s, a) => s + a, 0) / amounts.length).toFixed(2),
      trend: amounts.length >= 2 ? amounts[amounts.length-1] - amounts[0] : 0
    })).sort((a, b) => b.predicted - a.predicted);

    // Smart suggestions
    const suggestions = [];

    if (trendPct > 10) {
      suggestions.push({
        type: 'warning',
        message: `📈 খরচ গত ৩ মাসে ${trendPct}% বেড়েছে। এই মাসে সাবধান থাকুন!`
      });
    } else if (trendPct < -5) {
      suggestions.push({
        type: 'success',
        message: `📉 সাবাশ! খরচ ${Math.abs(trendPct)}% কমেছে। এভাবে চালিয়ে যান!`
      });
    }

    if (avgIncome > 0 && predicted > avgIncome * 0.8) {
      suggestions.push({
        type: 'warning',
        message: `⚠️ আয়ের ${((predicted/avgIncome)*100).toFixed(0)}% খরচ হতে পারে। সঞ্চয় কমে যাবে!`
      });
    }

    const topCat = catPredictions[0];
    if (topCat) {
      suggestions.push({
        type: 'info',
        message: `🔍 "${topCat.category}" এ সবচেয়ে বেশি খরচ হয় (গড়ে ৳${topCat.predicted})`
      });
    }

    if (predicted < avgExpense) {
      suggestions.push({
        type: 'success',
        message: `✅ এই মাসে ৳${(avgExpense - predicted).toFixed(0)} কম খরচ হওয়ার সম্ভাবনা আছে!`
      });
    }

    res.json({
      success: true,
      data: {
        historicalData: monthlyData,
        avgExpense:     +avgExpense.toFixed(2),
        avgIncome:      +avgIncome.toFixed(2),
        predicted,
        trendPct,
        catPredictions,
        suggestions,
        nextMonth: `${month === 12 ? year + 1 : year}-${String(month === 12 ? 1 : month + 1).padStart(2, '0')}`
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};