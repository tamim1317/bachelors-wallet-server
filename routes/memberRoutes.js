const router = require('express').Router();
const { getAll, create, update, remove } = require('../controllers/memberController');
const { protect, managerOnly } = require('../middleware/auth');

// Cloudinary configured থাকলে upload use করো
let upload;
try {
  upload = require('../config/cloudinary').upload;
} catch {
  // Cloudinary না থাকলে dummy middleware
  upload = { single: () => (req, res, next) => next() };
}

router.get('/',       protect, getAll);
router.post('/',      protect, managerOnly, upload.single('photo'), create);
router.put('/:id', protect, managerOnly, upload.single('photo'), update);
router.delete('/:id', protect, managerOnly, remove);

module.exports = router;