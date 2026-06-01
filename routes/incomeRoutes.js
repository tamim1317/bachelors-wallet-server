const router = require('express').Router();
const {
  getIncomes,
  createIncome,
  deleteIncome,
  getMonthlySummary
} = require('../controllers/incomeController');

router.get('/',                  getIncomes);
router.post('/',                 createIncome);
router.delete('/:id',            deleteIncome);
router.get('/summary/:month',    getMonthlySummary);

module.exports = router;