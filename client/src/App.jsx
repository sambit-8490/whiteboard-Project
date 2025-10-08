import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Canvas from './components/Canvas/Canvas';
import Toolbar from './components/Toolbar/Toolbar';
import UserList from './components/UserList/UserList';
import RoomControls from './components/RoomControls/RoomControls';
import { CanvasProvider } from './context/CanvasContext';
import './App.css';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

function App() {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [userName, setUserName] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Get room ID from URL or create new room
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');
    
    if (roomFromUrl) {
      setRoomId(roomFromUrl);
    }
  }, []);

  const joinRoom = (roomId, userName) => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.emit('join-room', { roomId, userName });
    
    newSocket.on('user-joined', (userInfo) => {
      setIsConnected(true);
      console.log('Successfully joined room:', userInfo);
    });

    newSocket.on('user-connected', (userInfo) => {
      setUsers(prev => [...prev.filter(u => u.userId !== userInfo.userId), userInfo]);
    });

    newSocket.on('user-disconnected', (userInfo) => {
      setUsers(prev => prev.filter(u => u.userId !== userInfo.userId));
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      alert('Failed to join room: ' + error);
    });

    // Update URL
    window.history.pushState({}, '', `?room=${roomId}`);
    setRoomId(roomId);
    setUserName(userName);
  };

  const leaveRoom = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setIsConnected(false);
    setUsers([]);
    window.history.pushState({}, '', '/');
  };

  if (!isConnected) {
    return (
      <div className="App">
        <RoomControls onJoinRoom={joinRoom} initialRoomId={roomId} />
      </div>
    );
  }

  return (
    <CanvasProvider socket={socket}>
      <div className="App">
        <header className="app-header">
          <h1>Collaborative Whiteboard</h1>
          <div className="room-info">
            <span>Room: {roomId}</span>
            <span>User: {userName}</span>
            <button onClick={leaveRoom} className="leave-btn">Leave Room</button>
          </div>
        </header>
        
        <div className="app-content">
          <aside className="sidebar">
            <Toolbar />
            <UserList users={users} />
          </aside>
          
          <main className="canvas-container">
            <Canvas />
          </main>
        </div>
      </div>
    </CanvasProvider>
  );
}

export default App;