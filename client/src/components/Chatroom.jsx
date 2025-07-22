// client/src/components/ChatRoom.js
import React, { useEffect, useState } from 'react';
import socket from '../socket';

const ChatRoom = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [partnerConnected, setPartnerConnected] = useState(false);

  useEffect(() => {
    socket.emit('findPartner');

    socket.on('partnerFound', () => {
      setPartnerConnected(true);
    });

    socket.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, { sender: 'partner', text: msg }]);
    });

    return () => {
      socket.off('partnerFound');
      socket.off('receiveMessage');
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('sendMessage', message);
      setMessages((prev) => [...prev, { sender: 'you', text: message }]);
      setMessage('');
    }
  };

  if (!partnerConnected) return <p>Looking for a partner...</p>;

  return (
    <div>
      <h2>💬 Chat with Stranger</h2>
      <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '1rem' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.sender === 'you' ? 'right' : 'left' }}>
            <p><strong>{msg.sender}:</strong> {msg.text}</p>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatRoom;
