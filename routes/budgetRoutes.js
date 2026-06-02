const router = require('express').Router();
const { getBudget, setBudget, getBudgetStatus } = require('../controllers/budgetController');

router.get('/:month',        getBudget);
router.post('/:month',       setBudget);
router.get('/status/:month', getBudgetStatus);

module.exports = router;