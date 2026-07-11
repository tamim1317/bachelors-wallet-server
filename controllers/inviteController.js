const crypto = require('crypto');
const User   = require('../models/User');
const Member = require('../models/Member');

// In-memory invite store (production এ Redis use করবে)
const inviteTokens = new Map();

// Invite token generate করো
exports.generateInvite = async (req, res) => {
  try {
    const token   = crypto.randomBytes(16).toString('hex');
    const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    inviteTokens.set(token, {
      messId:    req.user._id,
      messName:  req.body.messName || "Bachelor's Mess",
      createdBy: req.user.name,
      expires,
    });

    const inviteUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/join/${token}`;

    res.json({ success: true, data: { token, inviteUrl, expires } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Invite token validate করো
exports.validateInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const invite    = inviteTokens.get(token);

    if (!invite) {
      return res.status(404).json({ success: false, message: 'Invalid invite link' });
    }
    if (Date.now() > invite.expires) {
      inviteTokens.delete(token);
      return res.status(400).json({ success: false, message: 'Invite link মেয়াদ শেষ হয়ে গেছে' });
    }

    res.json({ success: true, data: invite });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Invite দিয়ে join করো
exports.joinByInvite = async (req, res) => {
  try {
    const { token }              = req.params;
    const { name, phone, password, securityQuestion, securityAnswer } = req.body;

    const invite = inviteTokens.get(token);
    if (!invite)             return res.status(404).json({ success: false, message: 'Invalid invite' });
    if (Date.now() > invite.expires) return res.status(400).json({ success: false, message: 'Invite মেয়াদ শেষ' });

    // Member তৈরি করো
    const member = await Member.create({ name, phone });

    // User তৈরি করো
    const bcrypt = require('bcryptjs');
    const userData = {
      name, phone, password,
      role: 'member',
      memberId: member._id,
    };

    if (securityQuestion && securityAnswer) {
      userData.securityQuestion = securityQuestion;
      userData.securityAnswer   = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 12);
    }

    const user = await User.create(userData);

    const jwt   = require('jsonwebtoken');
    const token2 = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      success: true,
      token: token2,
      data: { _id: user._id, name: user.name, role: user.role, memberId: user.memberId }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};