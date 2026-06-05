const router = require('express').Router();
const { getPrediction } = require('../controllers/predictionController');

router.get('/', getPrediction);

module.exports = router;