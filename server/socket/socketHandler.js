const Room = require('../models/Room');
const DrawingEvent = require('../models/DrawingEvent');

const connectedUsers = new Map();

const generateUserId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const getUserColors = () => [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
];

const handleSocketConnection = (socket, io) => {
  console.log('New client connected:', socket.id);

  // Join room
  socket.on('join-room', async ({ roomId, userName }) => {
    try {
      socket.join(roomId);
      
      const userId = generateUserId();
      const userColor = getUserColors()[Math.floor(Math.random() * getUserColors().length)];
      
      const userInfo = {
        userId,
        userName: userName || `User ${userId.substr(0, 4)}`,
        color: userColor,
        socketId: socket.id
      };
      
      connectedUsers.set(socket.id, { ...userInfo, roomId });

      // Update room with new user
      await Room.findOneAndUpdate(
        { roomId },
        { 
          $addToSet: { 
            activeUsers: {
              userId: userInfo.userId,
              userName: userInfo.userName,
              color: userInfo.color,
              lastSeen: new Date()
            }
          }
        },
        { upsert: true, new: true }
      );

      // Send user info to client
      socket.emit('user-joined', userInfo);

      // Broadcast to others in room
      socket.to(roomId).emit('user-connected', userInfo);

      // Send current room state
      const room = await Room.findOne({ roomId });
      if (room && room.canvasData) {
        socket.emit('canvas-state', room.canvasData);
      }

      // Send recent drawing events
      const recentEvents = await DrawingEvent
        .find({ roomId })
        .sort({ timestamp: -1 })
        .limit(1000);
      
      socket.emit('drawing-history', recentEvents.reverse());

      console.log(`User ${userInfo.userName} joined room ${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', 'Failed to join room');
    }
  });

  // Handle drawing events
  socket.on('drawing-event', async (data) => {
    try {
      const user = connectedUsers.get(socket.id);
      if (!user) return;

      const drawingEvent = new DrawingEvent({
        ...data,
        userId: user.userId,
        userName: user.userName,
        roomId: user.roomId
      });

      await drawingEvent.save();

      // Broadcast to all users in room except sender
      socket.to(user.roomId).emit('drawing-event', {
        ...data,
        userId: user.userId,
        userName: user.userName
      });

    } catch (error) {
      console.error('Error handling drawing event:', error);
    }
  });

  // Handle canvas save
  socket.on('save-canvas', async (canvasData) => {
    try {
      const user = connectedUsers.get(socket.id);
      if (!user) return;

      await Room.findOneAndUpdate(
        { roomId: user.roomId },
        { canvasData },
        { upsert: true }
      );

    } catch (error) {
      console.error('Error saving canvas:', error);
    }
  });

  // Handle cursor movement
  socket.on('cursor-move', (data) => {
    const user = connectedUsers.get(socket.id);
    if (!user) return;

    socket.to(user.roomId).emit('cursor-move', {
      ...data,
      userId: user.userId,
      userName: user.userName,
      color: user.color
    });
  });

  // Handle clear canvas
  socket.on('clear-canvas', async () => {
    try {
      const user = connectedUsers.get(socket.id);
      if (!user) return;

      // Clear drawing events for this room
      await DrawingEvent.deleteMany({ roomId: user.roomId });
      
      // Clear canvas data
      await Room.findOneAndUpdate(
        { roomId: user.roomId },
        { canvasData: null }
      );

      // Broadcast clear event
      io.to(user.roomId).emit('canvas-cleared');

    } catch (error) {
      console.error('Error clearing canvas:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    try {
      const user = connectedUsers.get(socket.id);
      if (user) {
        // Remove user from room
        await Room.findOneAndUpdate(
          { roomId: user.roomId },
          { $pull: { activeUsers: { userId: user.userId } } }
        );

        // Notify others
        socket.to(user.roomId).emit('user-disconnected', {
          userId: user.userId,
          userName: user.userName
        });

        connectedUsers.delete(socket.id);
        console.log(`User ${user.userName} disconnected from room ${user.roomId}`);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
};

module.exports = { handleSocketConnection };