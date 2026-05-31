const router = require('express').Router();
const { getMealsByDate, upsertMeal, getMonthlySummary } = require('../controllers/mealController');

router.get('/date/:date',            getMealsByDate);
router.post('/entry',                upsertMeal);
router.get('/summary/:year/:month',  getMonthlySummary);

module.exports = router;
