// client/src/App.jsx
import React, { useEffect } from 'react';
import { socket } from './socket';
import ChatRoom from './components/ChatRoom';
import VideoChat from './components/VideoChat';
import ChatBox from './components/ChatBox';

function App() {
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to backend:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return (
    <div className="App">
      <h1>🎥 Welcome to Omegle Clone</h1>
      <p>The frontend is working!</p>

      <VideoChat />
      <ChatRoom />
      <ChatBox />
    </div>
  );
}

export default App;
