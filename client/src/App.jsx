import React from 'react';
import ChatRoom from '.components/ChatRoom';
import VideoChat from './components/VideoChat';

function App() {
  return (
    <div>
      <h1>🎥 Welcome to Omegle Clone</h1>
      <VideoChat />
      <ChatRoom />
    </div>
  );
}

export default App;
