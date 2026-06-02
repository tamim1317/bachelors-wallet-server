const router = require('express').Router();
const { getAll, create, togglePin, remove } = require('../controllers/noticeController');

router.get('/',           getAll);
router.post('/',          create);
router.patch('/:id/pin',  togglePin);
router.delete('/:id',     remove);

module.exports = router;