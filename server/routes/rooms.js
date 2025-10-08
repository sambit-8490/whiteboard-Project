const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { v4: uuidv4 } = require('uuid');

// Create new room
router.post('/create', async (req, res) => {
  try {
    const { name, createdBy } = req.body;
    const roomId = uuidv4().substr(0, 8);
    
    const room = new Room({
      roomId,
      name: name || 'Untitled Board',
      createdBy: createdBy || 'Anonymous'
    });

    await room.save();
    res.json({ roomId, message: 'Room created successfully' });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Get room info
router.get('/:roomId', async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

module.exports = router;