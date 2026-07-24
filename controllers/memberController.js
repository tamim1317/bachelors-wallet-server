const Member = require('../models/Member');

exports.getAll = async (req, res) => {
  try {
    const members = await Member.find({ status: 'active' }).sort({ room: 1, createdAt: 1 });
    res.json({ success: true, data: members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, phone, room } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'নাম দিন' });

    // Auto room number
    let autoRoom = room;
    if (!autoRoom) {
      const lastMember = await Member.findOne({ status: 'active' }).sort({ createdAt: -1 });
      if (lastMember?.room) {
        const lastNum = parseInt(lastMember.room);
        autoRoom = isNaN(lastNum) ? '101' : String(lastNum + 1);
      } else {
        autoRoom = '101';
      }
    }

    const memberData = { name: name.trim(), phone: phone || '', room: autoRoom };
    if (req.file?.path) memberData.photo = req.file.path;

    const member = await Member.create(memberData);
    res.status(201).json({ success: true, data: member });
  } catch (err) {
    console.error('Create member error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file?.path) updateData.photo = req.file.path;
    const member = await Member.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!member) return res.status(404).json({ success: false, message: 'Member পাওয়া যায়নি' });
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Member.findByIdAndUpdate(req.params.id, { status: 'left' });
    res.json({ success: true, message: 'Member সরানো হয়েছে' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};