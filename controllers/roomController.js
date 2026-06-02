const Room   = require('../models/Room');
const Member = require('../models/Member');

exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('occupants', 'name phone')
      .sort({ roomNumber: 1 });
    res.json({ success: true, data: rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('occupants', 'name phone');
    if (!room) return res.status(404).json({ success: false, message: 'Room পাওয়া যায়নি' });
    res.json({ success: true, data: room });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Room মুছে ফেলা হয়েছে' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Member কে room এ assign করো
exports.assignMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room পাওয়া যায়নি' });

    if (room.occupants.includes(memberId)) {
      return res.status(400).json({ success: false, message: 'এই member ইতোমধ্যে এই room এ আছে' });
    }

    if (room.occupants.length >= room.capacity) {
      return res.status(400).json({ success: false, message: 'Room পূর্ণ!' });
    }

    room.occupants.push(memberId);
    room.status = 'occupied';
    await room.save();

    // Member এর room update করো
    await Member.findByIdAndUpdate(memberId, { room: room.roomNumber });

    const updated = await Room.findById(req.params.id).populate('occupants', 'name phone');
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Member কে room থেকে সরাও
exports.removeMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room পাওয়া যায়নি' });

    room.occupants = room.occupants.filter(id => id.toString() !== memberId);
    room.status = room.occupants.length === 0 ? 'vacant' : 'occupied';
    await room.save();

    const updated = await Room.findById(req.params.id).populate('occupants', 'name phone');
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Room statistics
exports.getRoomStats = async (req, res) => {
  try {
    const rooms = await Room.find();
    const stats = {
      total:       rooms.length,
      occupied:    rooms.filter(r => r.status === 'occupied').length,
      vacant:      rooms.filter(r => r.status === 'vacant').length,
      maintenance: rooms.filter(r => r.status === 'maintenance').length,
      totalRent:   rooms.reduce((sum, r) => sum + r.monthlyRent, 0),
    };
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};