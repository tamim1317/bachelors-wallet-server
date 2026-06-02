const Expense = require('../models/Expense');
const Member  = require('../models/Member');

exports.calculateSettlement = async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate   = new Date(year, month, 0, 23, 59, 59);

    // সব mess expense আনো
    const expenses = await Expense.find({
      type: 'mess',
      date: { $gte: startDate, $lte: endDate }
    }).populate('memberId', 'name');

    const members = await Member.find({ status: 'active' });
    const total   = expenses.reduce((sum, e) => sum + e.amount, 0);
    const perHead = total / members.length;

    // কে কত খরচ করেছে
    const paid = {};
    members.forEach(m => { paid[m._id.toString()] = { name: m.name, amount: 0 }; });

    expenses.forEach(e => {
      if (e.memberId) {
        const id = e.memberId._id?.toString() || e.memberId.toString();
        if (paid[id]) paid[id].amount += e.amount;
      }
    });

    // Balance calculate করো
    const balances = members.map(m => {
      const id      = m._id.toString();
      const paidAmt = paid[id]?.amount || 0;
      return {
        memberId: m._id,
        name:     m.name,
        paid:     paidAmt,
        share:    +perHead.toFixed(2),
        balance:  +(paidAmt - perHead).toFixed(2), // positive = পাবে, negative = দেবে
      };
    });

    // Settlement transactions
    const creditors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);
    const debtors   = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);

    const transactions = [];
    let i = 0, j = 0;
    const cred = creditors.map(c => ({ ...c, remaining: c.balance }));
    const debt = debtors.map(d => ({ ...d, remaining: Math.abs(d.balance) }));

    while (i < cred.length && j < debt.length) {
      const amount = Math.min(cred[i].remaining, debt[j].remaining);
      if (amount > 0.5) {
        transactions.push({
          from:   debt[j].name,
          to:     cred[i].name,
          amount: +amount.toFixed(2),
        });
      }
      cred[i].remaining -= amount;
      debt[j].remaining -= amount;
      if (cred[i].remaining < 0.5) i++;
      if (debt[j].remaining < 0.5) j++;
    }

    res.json({
      success: true,
      data: {
        total: +total.toFixed(2),
        perHead: +perHead.toFixed(2),
        balances,
        transactions,
        month: `${year}-${String(month).padStart(2, '0')}`,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};