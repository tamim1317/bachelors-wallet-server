const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const Member = require('../models/Member');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Register
exports.register = async (req, res) => {
  try {
    const { name, phone, email, password, role, memberId } = req.body;

    // Manager শুধু একজন হতে পারবে
    if (role === 'manager') {
      const existing = await User.findOne({ role: 'manager' });
      if (existing) return res.status(400).json({ success: false, message: 'Manager ইতোমধ্যে আছে' });
    }

    const user = await User.create({ name, phone, email, password, role, memberId });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      data: {
        _id:      user._id,
        name:     user.name,
        role:     user.role,
        memberId: user.memberId,
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ success: false, message: 'Phone ও password দিন' });

    const user = await User.findOne({ phone });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Phone বা password ভুল' });
    }

    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    res.json({
      success: true,
      token,
      data: {
        _id:      user._id,
        name:     user.name,
        role:     user.role,
        memberId: user.memberId,
        phone:    user.phone,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('memberId', 'name room phone');
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// সব users (manager only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('-password')
      .populate('memberId', 'name room');
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};