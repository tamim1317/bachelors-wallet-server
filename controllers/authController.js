const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const Member = require('../models/Member');
const bcrypt = require('bcryptjs');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Register
exports.register = async (req, res) => {
  try {
    const { name, phone, email, password, role, memberId, securityQuestion, securityAnswer } = req.body;

    if (role === 'manager') {
      const existing = await User.findOne({ role: 'manager' });
      if (existing) return res.status(400).json({ success: false, message: 'Manager ইতোমধ্যে আছে' });
    }

    const userData = { name, phone, email, password, role, memberId };

    // Security question থাকলে hash করো
    if (securityQuestion && securityAnswer) {
      const bcrypt = require('bcryptjs');
      userData.securityQuestion = securityQuestion;
      userData.securityAnswer   = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 12);
    }

    const user  = await User.create(userData);
    const token = signToken(user._id);

    res.status(201).json({
      success: true, token,
      data: { _id: user._id, name: user.name, role: user.role, memberId: user.memberId }
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

// Security question set করো
exports.setSecurityQuestion = async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, message: 'Question ও answer দিন' });
    }
    const hashedAnswer = await bcrypt.hash(answer.toLowerCase().trim(), 12);
    await User.findByIdAndUpdate(req.user._id, {
      securityQuestion: question,
      securityAnswer:   hashedAnswer
    });
    res.json({ success: true, message: 'Security question সেট হয়েছে' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Password reset করো
exports.resetPassword = async (req, res) => {
  try {
    const { phone, answer, newPassword } = req.body;
    if (!phone || !answer || !newPassword) {
      return res.status(400).json({ success: false, message: 'সব field পূরণ করুন' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password কমপক্ষে ৬ অক্ষর' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'এই phone নম্বরে কোনো account নেই' });
    }
    if (!user.securityAnswer) {
      return res.status(400).json({ success: false, message: 'Security question সেট করা নেই। Manager এর সাথে যোগাযোগ করুন।' });
    }

    const isMatch = await bcrypt.compare(answer.toLowerCase().trim(), user.securityAnswer);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'উত্তর সঠিক নয়' });
    }

    user.password = newPassword;
    await user.save();

    const token = signToken(user._id);
    res.json({ success: true, message: 'Password reset হয়েছে!', token, data: { _id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Manager যেকোনো user এর password reset করবে
exports.adminResetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password কমপক্ষে ৬ অক্ষর' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User পাওয়া যায়নি' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: `${user.name} এর password reset হয়েছে` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};