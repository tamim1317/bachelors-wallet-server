const router = require('express').Router();
const { getExpenses, createExpense, deleteExpense, getMessExpenseSummary } = require('../controllers/expenseController');

router.get('/',                       getExpenses);
router.post('/',                      createExpense);
router.delete('/:id',                 deleteExpense);
router.get('/mess/:year/:month',      getMessExpenseSummary);

module.exports = router;
