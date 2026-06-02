const Mess = require('../models/Mess');

exports.getAll = async (req, res) => {
  try {
    const messes = await Mess.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: messes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const mess = await Mess.create(req.body);
    res.status(201).json({ success: true, data: mess });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const mess = await Mess.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!mess) return res.status(404).json({ success: false, message: 'Mess পাওয়া যায়নি' });
    res.json({ success: true, data: mess });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Mess.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Mess সরানো হয়েছে' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};