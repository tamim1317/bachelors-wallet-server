const router = require('express').Router();
const { calculateSettlement } = require('../controllers/settlementController');

router.get('/:year/:month', calculateSettlement);

module.exports = router;