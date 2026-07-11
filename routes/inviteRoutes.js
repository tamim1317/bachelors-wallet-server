const router = require('express').Router();
const { generateInvite, validateInvite, joinByInvite } = require('../controllers/inviteController');
const { protect, managerOnly } = require('../middleware/auth');

router.post('/generate',      protect, managerOnly, generateInvite);
router.get('/validate/:token', validateInvite);
router.post('/join/:token',    joinByInvite);

module.exports = router;