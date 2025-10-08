const mongoose = require('mongoose');

const drawingEventSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true
  },
  userId: String,
  userName: String,
  eventType: {
    type: String,
    enum: ['draw', 'erase', 'clear', 'undo', 'redo'],
    required: true
  },
  tool: {
    type: String,
    enum: ['pen', 'eraser', 'rectangle', 'circle', 'line', 'text']
  },
  coordinates: [{
    x: Number,
    y: Number,
    pressure: Number
  }],
  style: {
    color: String,
    width: Number,
    opacity: Number,
    fill: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// TTL index to automatically delete old events (optional)
drawingEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 }); // 7 days

module.exports = mongoose.model('DrawingEvent', drawingEventSchema);