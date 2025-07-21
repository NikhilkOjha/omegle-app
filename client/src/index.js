import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://omegle-app-0887.onrender.com'); // ✅ Render backend

function App() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return (
    <div>
      <h1>Omegle App</h1>
      {connected ? <p>🔌 Connected to chat server</p> : <p>❌ Not connected</p>}
    </div>
  );
}

export default App;
