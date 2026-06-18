const Meal = require('../models/Meal');
const Member = require('../models/Member');

// একটি দিনের সব member-এর meal দেখো
exports.getMealsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await Meal.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('memberId', 'name room');

    res.json({ success: true, data: meals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Meal entry দাও বা update করো
exports.upsertMeal = async (req, res) => {
  try {
    const { memberId, date, breakfast, lunch, dinner, guestMeals } = req.body;
    const mealDate = new Date(date);
    mealDate.setHours(0, 0, 0, 0);

    const meal = await Meal.findOneAndUpdate(
      { memberId, date: mealDate },
      { breakfast, lunch, dinner, guestMeals },
      { upsert: true, new: true }
    );

    // 🔴 Real-time broadcast
    if (global.io) {
      global.io.emit('meal:updated', {
        memberId, date,
        breakfast, lunch, dinner, guestMeals
      });
    }

    res.json({ success: true, data: meal });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// একটি মাসের meal summary (bill-এর জন্য)
exports.getMonthlySummary = async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate   = new Date(year, month, 0, 23, 59, 59);

    const meals = await Meal.find({ date: { $gte: startDate, $lte: endDate } });
    const members = await Member.find({ status: 'active' });

    // প্রতিটি member-এর মোট meal count করো
    const summary = members.map(member => {
      const memberMeals = meals.filter(m => m.memberId.toString() === member._id.toString());
      const totalMeals = memberMeals.reduce((sum, m) => {
        return sum + (m.breakfast ? 1 : 0) + (m.lunch ? 1 : 0) + (m.dinner ? 1 : 0) + (m.guestMeals || 0);
      }, 0);
      return {
        memberId: member._id,
        name: member.name,
        room: member.room,
        totalMeals
      };
    });

    // মোট mess meal
    const totalMessMeals = summary.reduce((sum, s) => sum + s.totalMeals, 0);

    res.json({ success: true, data: { summary, totalMessMeals } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
