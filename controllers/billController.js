const MonthlyBill = require('../models/MonthlyBill');
const Expense = require('../models/Expense');
const Meal = require('../models/Meal');
const Member = require('../models/Member');

// মাসের bill generate করো (সবচেয়ে গুরুত্বপূর্ণ!)
exports.generateBill = async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate   = new Date(year, month, 0, 23, 59, 59);
    const monthStr  = `${year}-${String(month).padStart(2, '0')}`;

    // ১. মোট mess bazar খরচ বের করো
    const messExpenses = await Expense.find({ type: 'mess', date: { $gte: startDate, $lte: endDate } });
    const totalMessCost = messExpenses.reduce((sum, e) => sum + e.amount, 0);

    // ২. সব member-এর meal count করো
    const meals = await Meal.find({ date: { $gte: startDate, $lte: endDate } });
    const members = await Member.find({ status: 'active' });

    let totalMessMeals = 0;
    const memberMealCounts = {};

    members.forEach(m => { memberMealCounts[m._id.toString()] = 0; });
    meals.forEach(meal => {
      const id = meal.memberId.toString();
      if (memberMealCounts[id] !== undefined) {
        const count = (meal.breakfast ? 1 : 0) + (meal.lunch ? 1 : 0) + (meal.dinner ? 1 : 0) + (meal.guestMeals || 0);
        memberMealCounts[id] += count;
        totalMessMeals += count;
      }
    });

    // ৩. প্রতি মিলের রেট = মোট খরচ ÷ মোট মিল
    const mealRate = totalMessMeals > 0 ? +(totalMessCost / totalMessMeals).toFixed(2) : 0;

    // ৪. প্রতিটি member-এর bill তৈরি করো
    const bills = [];
    for (const member of members) {
      const totalMeals = memberMealCounts[member._id.toString()] || 0;
      const mealCost   = +(totalMeals * mealRate).toFixed(2);
      const totalBill  = mealCost;

      const bill = await MonthlyBill.findOneAndUpdate(
        { month: monthStr, memberId: member._id },
        { totalMeals, mealRate, mealCost, totalBill },
        { upsert: true, new: true }
      );
      bills.push({ ...bill.toObject(), name: member.name, room: member.room });
    }

    res.json({
      success: true,
      data: {
        month: monthStr,
        totalMessCost,
        totalMessMeals,
        mealRate,
        bills
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Payment mark করো
exports.markAsPaid = async (req, res) => {
  try {
    const bill = await MonthlyBill.findByIdAndUpdate(
      req.params.id,
      { paid: true, paidDate: new Date() },
      { new: true }
    );
    res.json({ success: true, data: bill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// মাসের সব bill দেখো
exports.getBillsByMonth = async (req, res) => {
  try {
    const { year, month } = req.params;
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const bills = await MonthlyBill.find({ month: monthStr }).populate('memberId', 'name room');
    res.json({ success: true, data: bills });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
