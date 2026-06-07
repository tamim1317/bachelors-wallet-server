const router = require('express').Router();
const {
  register, login, getMe, getUsers,
  setSecurityQuestion, resetPassword, adminResetPassword
} = require('../controllers/authController');
const { protect, managerOnly } = require('../middleware/auth');

router.post('/register',          register);
router.post('/login',             login);
router.get('/me',                 protect, getMe);
router.get('/users',              protect, managerOnly, getUsers);
router.post('/security-question', protect, setSecurityQuestion);
router.post('/reset-password',    resetPassword);
router.post('/admin-reset',       protect, managerOnly, adminResetPassword);
router.post('/reset-password', resetPassword);

module.exports = router;