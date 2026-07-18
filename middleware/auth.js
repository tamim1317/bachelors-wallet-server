const jwt  = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    // Token check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Login করুন' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token পাওয়া যায়নি' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // User exists check
    const user = await User.findById(decoded.id).select('-password -securityAnswer');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User আর নেই' });
    }

    // Active check
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account inactive' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired। আবার login করুন' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.managerOnly = (req, res, next) => {
  if (req.user?.role !== 'manager') {
    return res.status(403).json({
      success: false,
      message: 'শুধুমাত্র Manager এই কাজ করতে পারবে'
    });
  }
  next();
};

exports.selfOrManager = (req, res, next) => {
  if (req.user?.role === 'manager') return next();
  if (req.params.userId && req.params.userId !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'শুধু নিজের data দেখতে পারবেন'
    });
  }
  next();
};