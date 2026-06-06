const Message = require('../models/Message');

// Messages পড়ো
exports.getMessages = async (req, res) => {
  try {
    const page  = +req.query.page  || 1;
    const limit = +req.query.limit || 50;
    const skip  = (page - 1) * limit;

    const messages = await Message.find({ isDeleted: false })
      .populate('sender', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ success: true, data: messages.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Message পাঠাও
exports.sendMessage = async (req, res) => {
  try {
    const { content, type } = req.body;
    if (!content?.trim()) return res.status(400).json({ success: false, message: 'Message লিখুন' });

    // Announcement শুধু manager দিতে পারবে
    if (type === 'announcement' && req.user.role !== 'manager') {
      return res.status(403).json({ success: false, message: 'শুধু Manager announcement দিতে পারবে' });
    }

    const message = await Message.create({
      sender:  req.user._id,
      content: content.trim(),
      type:    type || 'text'
    });

    const populated = await message.populate('sender', 'name role');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Message delete (manager বা নিজেরটা)
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message পাওয়া যায়নি' });

    if (message.sender.toString() !== req.user._id.toString() && req.user.role !== 'manager') {
      return res.status(403).json({ success: false, message: 'এই message মুছতে পারবেন না' });
    }

    message.isDeleted = true;
    await message.save();
    res.json({ success: true, message: 'Message মুছে ফেলা হয়েছে' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};