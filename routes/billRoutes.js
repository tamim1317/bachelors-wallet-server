const router = require('express').Router();
const { generateBill, markAsPaid, getBillsByMonth } = require('../controllers/billController');

router.post('/generate/:year/:month',  generateBill);
router.get('/:year/:month',            getBillsByMonth);
router.patch('/pay/:id',               markAsPaid);

module.exports = router;
