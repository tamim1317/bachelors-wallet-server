const Notice = require('../models/Notice');

exports.getAll = async (req, res) => {
  try {
    const notices = await Notice.find({ isActive: true })
      .sort({ isPinned: -1, createdAt: -1 });
    res.json({ success: true, data: notices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const notice = await Notice.create(req.body);
    res.status(201).json({ success: true, data: notice });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.togglePin = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ success: false, message: 'Notice পাওয়া যায়নি' });
    notice.isPinned = !notice.isPinned;
    await notice.save();
    res.json({ success: true, data: notice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Notice.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Notice মুছে ফেলা হয়েছে' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};