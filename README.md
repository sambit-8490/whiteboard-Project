# Collaborative Whiteboard

A real-time collaborative whiteboard application built with React, Node.js, Socket.IO, and MongoDB. Multiple users can join the same room and draw together in real-time.

## 🚀 Features

- **Real-time Collaboration**: Multiple users can draw simultaneously
- **Drawing Tools**: Pen, eraser, shapes (rectangle, circle, line), and text
- **User Management**: See who's online in each room
- **Room System**: Create or join rooms with unique IDs
- **Canvas Persistence**: Drawing history is saved and restored
- **Responsive Design**: Works on desktop and mobile devices
- **User Colors**: Each user gets a unique color for their drawings and cursor

## 🏗️ Project Structure

```
collaborative-whiteboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context for state management
│   │   └── assets/         # Static assets
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── server/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── socket/             # Socket.IO handlers
│   ├── package.json        # Backend dependencies
│   └── server.js           # Main server file
└── README.md
```

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)

## 🗄️ Database Setup

### Option 1: MongoDB Atlas (Recommended for Production)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free account
2. Create a new cluster
3. Get your connection string from the "Connect" button
4. Replace `<username>` and `<password>` in the connection string with your credentials

### Option 2: Local MongoDB

1. Install MongoDB locally on your machine
2. Start the MongoDB service
3. The default connection string will be: `mongodb://localhost:27017/collaborative-whiteboard`

### Database Models

The application uses two main MongoDB collections:

#### Room Model
```javascript
{
  roomId: String,           // Unique room identifier
  name: String,            // Room name
  createdBy: String,       // Creator's name
  activeUsers: [{          // Currently connected users
    userId: String,
    userName: String,
    color: String,
    lastSeen: Date
  }],
  settings: {              // Room configuration
    isPrivate: Boolean,
    allowGuests: Boolean,
    maxUsers: Number
  },
  canvasData: String       // Base64 encoded canvas state
}
```

#### DrawingEvent Model
```javascript
{
  roomId: String,          // Associated room
  userId: String,          // User who performed the action
  userName: String,        // User's display name
  eventType: String,       // 'draw', 'erase', 'clear', 'undo', 'redo'
  tool: String,           // 'pen', 'eraser', 'rectangle', 'circle', 'line', 'text'
  coordinates: [{          // Drawing coordinates
    x: Number,
    y: Number,
    pressure: Number
  }],
  style: {                // Drawing style
    color: String,
    width: Number,
    opacity: Number,
    fill: String
  },
  timestamp: Date         // When the event occurred
}
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd collaborative-whiteboard
```

### 2. Environment Configuration

Create a `.env` file in the `server/` directory:

```bash
# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:5173

# MongoDB Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/collaborative-whiteboard?retryWrites=true&w=majority

# For local MongoDB (alternative)
# MONGODB_URI=mongodb://localhost:27017/collaborative-whiteboard
```

**Important**: Replace `<username>` and `<password>` with your actual MongoDB credentials.

### 3. Install Dependencies

#### Backend Dependencies
```bash
cd server
npm install
```

#### Frontend Dependencies
```bash
cd ../client
npm install
```

### 4. Start the Application

#### Option 1: Run Both Servers Separately

**Terminal 1 - Start Backend Server:**
```bash
cd server
npm run dev
```
The backend server will start on `http://localhost:5000`

**Terminal 2 - Start Frontend Server:**
```bash
cd client
npm run dev
```
The frontend will start on `http://localhost:5173`

#### Option 2: Run Both Servers (Alternative)

From the project root directory, you can run both servers using:

```bash
# Backend
cd server && npm run dev &

# Frontend  
cd client && npm run dev
```

## 🌐 Usage

1. **Open the Application**: Navigate to `http://localhost:5173`
2. **Create a Room**: Enter your name and click "Create New Room"
3. **Join a Room**: Enter a room ID and your name to join an existing room
4. **Start Drawing**: Use the toolbar on the left to select drawing tools
5. **Collaborate**: Share the room URL with others to collaborate in real-time

## 🛠️ API Endpoints

### Room Management

- `POST /api/rooms/create` - Create a new room
  ```json
  {
    "name": "My Whiteboard",
    "createdBy": "John Doe"
  }
  ```

- `GET /api/rooms/:roomId` - Get room information

### Socket.IO Events

#### Client → Server
- `join-room` - Join a room
- `drawing-event` - Send drawing data
- `save-canvas` - Save canvas state
- `cursor-move` - Send cursor position
- `clear-canvas` - Clear the canvas

#### Server → Client
- `user-joined` - User successfully joined
- `user-connected` - Another user joined
- `user-disconnected` - User left the room
- `drawing-event` - Receive drawing data
- `drawing-history` - Canvas history for new users
- `canvas-state` - Current canvas state
- `canvas-cleared` - Canvas was cleared
- `cursor-move` - Other user's cursor position

## 🔧 Configuration

### Frontend Configuration (Vite)

The frontend uses Vite for development and building. Configuration is in `client/vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
```

### Backend Configuration

Key configuration in `server/server.js`:

```javascript
// CORS configuration
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check your MongoDB URI in the `.env` file
   - Ensure your MongoDB service is running
   - Verify network access if using MongoDB Atlas

2. **Socket Connection Issues**
   - Make sure both frontend and backend servers are running
   - Check if ports 5000 and 5173 are available
   - Verify CORS settings in `server.js`

3. **Drawing Not Syncing**
   - Check browser console for errors
   - Verify Socket.IO connection status
   - Ensure MongoDB is connected and accessible

4. **Canvas Not Loading**
   - Check if room exists in the database
   - Verify drawing events are being saved
   - Clear browser cache and try again

### Database Connection Debugging

To debug database issues, you can:

1. Check server logs for MongoDB connection status
2. Use MongoDB Compass to verify data is being saved
3. Check the browser's Network tab for API call failures

## 📦 Dependencies

### Backend Dependencies
- `express` - Web framework
- `socket.io` - Real-time communication
- `mongoose` - MongoDB ODM
- `cors` - Cross-origin resource sharing
- `helmet` - Security middleware
- `express-rate-limit` - Rate limiting
- `dotenv` - Environment variables
- `uuid` - Unique identifier generation

### Frontend Dependencies
- `react` - UI library
- `socket.io-client` - Socket.IO client
- `fabric` - Canvas library
- `tailwindcss` - CSS framework
- `react-color` - Color picker component
- `axios` - HTTP client

## 🔒 Security Features

- **Rate Limiting**: Prevents API abuse
- **Helmet**: Sets security headers
- **CORS**: Configures cross-origin requests
- **Input Validation**: Validates drawing events
- **TTL Indexes**: Automatically removes old drawing events (7 days)

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

1. Build the frontend:
   ```bash
   cd client
   npm run build
   ```

2. Set environment variable:
   ```
   VITE_SOCKET_URL=your-backend-url
   ```

### Backend Deployment (Heroku/Railway)

1. Set environment variables:
   ```
   PORT=5000
   MONGODB_URI=your-mongodb-connection-string
   CLIENT_URL=your-frontend-url
   ```

2. Deploy using your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the server logs for error messages
3. Ensure all dependencies are properly installed
4. Verify your MongoDB connection string

---

**Happy Drawing! 🎨**
