const router = require('express').Router();
const { getMessages, sendMessage, deleteMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/',       protect, getMessages);
router.post('/',      protect, sendMessage);
router.delete('/:id', protect, deleteMessage);

module.exports = router;