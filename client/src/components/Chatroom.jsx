import React, { useEffect, useState } from 'react';
import socket from '../socket';

const ChatRoom = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [partnerConnected, setPartnerConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(true);

  // Function to start finding a partner
  const findPartner = () => {
    setIsSearching(true);
    setPartnerConnected(false);
    setMessages([]);
    socket.emit('findPartner');
  };

  useEffect(() => {
    findPartner();

    socket.on('partnerFound', () => {
      setPartnerConnected(true);
      setIsSearching(false);
    });

    socket.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, { sender: 'partner', text: msg }]);
    });

    socket.on('partnerDisconnected', () => {
      setPartnerConnected(false);
      setIsSearching(true);
      setMessages([]);
      setTimeout(findPartner, 2000); // Retry after 2 seconds
    });

    return () => {
      socket.off('partnerFound');
      socket.off('receiveMessage');
      socket.off('partnerDisconnected');
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('sendMessage', message);
      setMessages((prev) => [...prev, { sender: 'you', text: message }]);
      setMessage('');
    }
  };

  const skipPartner = () => {
    socket.emit('skipPartner');
    findPartner();
  };

  if (isSearching || !partnerConnected) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>🔍 Searching for a partner...</h2>
        <div className="loader" />
        <style>
          {`
            .loader {
              margin: 1rem auto;
              border: 6px solid #f3f3f3;
              border-top: 6px solid #3498db;
              border-radius: 50%;
              width: 50px;
              height: 50px;
              animation: spin 1s linear infinite;
            }

            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '1rem auto', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>💬 Chat with Stranger</h2>
      <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem', border: '1px solid #ddd', padding: '0.5rem' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.sender === 'you' ? 'right' : 'left' }}>
            <p><strong>{msg.sender}:</strong> {msg.text}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
          style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button onClick={sendMessage} style={{ padding: '0.5rem 1rem' }}>Send</button>
      </div>

      <button onClick={skipPartner} style={{
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer'
      }}>
        🔁 Skip
      </button>
    </div>
  );
};

export default ChatRoom;
