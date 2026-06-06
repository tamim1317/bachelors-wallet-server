const router = require('express').Router();
const { register, login, getMe, getUsers } = require('../controllers/authController');
const { protect, managerOnly } = require('../middleware/auth');

router.post('/register', register);
router.post('/login',    login);
router.get('/me',        protect, getMe);
router.get('/users',     protect, managerOnly, getUsers);

module.exports = router;