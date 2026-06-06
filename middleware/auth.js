const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// Token verify করো
exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Login করুন' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'User পাওয়া যায়নি' });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Manager only route
exports.managerOnly = (req, res, next) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ success: false, message: 'শুধুমাত্র Manager এই কাজ করতে পারবে' });
  }
  next();
};

// Manager অথবা নিজের data
exports.selfOrManager = (req, res, next) => {
  if (req.user.role === 'manager') return next();
  if (req.params.userId && req.params.userId !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'শুধু নিজের data দেখতে পারবেন' });
  }
  next();
};