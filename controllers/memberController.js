const Member = require('../models/Member');

// সব member দেখো
exports.getMembers = async (req, res) => {
  try {
    const members = await Member.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json({ success: true, data: members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// নতুন member যোগ করো
exports.createMember = async (req, res) => {
  try {
    const member = await Member.create(req.body);
    res.status(201).json({ success: true, data: member });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// member update করো
exports.updateMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!member) return res.status(404).json({ success: false, message: 'Member পাওয়া যায়নি' });
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// member delete (soft delete)
exports.deleteMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, { status: 'left' }, { new: true });
    if (!member) return res.status(404).json({ success: false, message: 'Member পাওয়া যায়নি' });
    res.json({ success: true, message: 'Member সরানো হয়েছে' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
