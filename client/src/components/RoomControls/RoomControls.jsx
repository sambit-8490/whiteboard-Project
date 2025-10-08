// import React, { useState } from 'react';

// const RoomControls = ({ onJoinRoom, initialRoomId = '' }) => {
//   const [roomId, setRoomId] = useState(initialRoomId);
//   const [userName, setUserName] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!roomId || !userName) return;
//     onJoinRoom(roomId, userName);
//   };

//   return (
//     <div className="room-controls">
//       <h2>Join a Room</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           placeholder="Room ID"
//           value={roomId}
//           onChange={(e) => setRoomId(e.target.value)}
//         />
//         <input
//           type="text"
//           placeholder="Your name"
//           value={userName}
//           onChange={(e) => setUserName(e.target.value)}
//         />
//         <button type="submit">Join</button>
//       </form>
//     </div>
//   );
// };

// export default RoomControls;


import React, { useState } from 'react';

const RoomControls = ({ onJoinRoom, initialRoomId = '' }) => {
  const [roomId, setRoomId] = useState(initialRoomId);
  const [userName, setUserName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roomId || !userName) return;
    onJoinRoom(roomId, userName);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          🎨 Join a Whiteboard Room
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
          >
            🚀 Join Room
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoomControls;
