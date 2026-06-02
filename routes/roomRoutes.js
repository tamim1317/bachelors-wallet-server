const router = require('express').Router();
const {
  getRooms, createRoom, updateRoom, deleteRoom,
  assignMember, removeMember, getRoomStats
} = require('../controllers/roomController');

router.get('/',                    getRooms);
router.get('/stats',               getRoomStats);
router.post('/',                   createRoom);
router.put('/:id',                 updateRoom);
router.delete('/:id',              deleteRoom);
router.post('/:id/assign',         assignMember);
router.post('/:id/remove-member',  removeMember);

module.exports = router;