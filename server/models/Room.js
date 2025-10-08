const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    default: 'Untitled Board'
  },
  createdBy: {
    type: String,
    required: true
  },
  activeUsers: [{
    userId: String,
    userName: String,
    color: String,
    lastSeen: Date
  }],
  settings: {
    isPrivate: { type: Boolean, default: false },
    allowGuests: { type: Boolean, default: true },
    maxUsers: { type: Number, default: 50 }
  },
  canvasData: {
    type: String, // Base64 encoded canvas data
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);