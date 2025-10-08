const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use('/api', limiter);

// MongoDB connection (non-fatal if DB is down)
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://<username>:<password>@myDatabase.trd0czx.mongodb.net/myDatabase?retryWrites=true&w=majority';
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection failed:', err?.message || err);
  });

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

// Models
const Room = require('./models/Room');
const DrawingEvent = require('./models/DrawingEvent');

// Routes
app.use('/api/rooms', require('./routes/rooms'));

// Socket handling
const { handleSocketConnection } = require('./socket/socketHandler');
io.on('connection', (socket) => handleSocketConnection(socket, io));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});