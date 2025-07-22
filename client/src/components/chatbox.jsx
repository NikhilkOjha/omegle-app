// client/src/components/ChatBox.js
import React, { useState, useEffect } from 'react';
import { socket } from '../socket';

const ChatBox = () => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    socket.on('waiting', () => {
      setMessages([{ text: 'Waiting for a partner...', system: true }]);
    });

    socket.on('partner-found', () => {
      setConnected(true);
      setMessages((prev) => [...prev, { text: 'Partner connected!', system: true }]);
    });

    socket.on('chat-message', (msg) => {
      setMessages((prev) => [...prev, { text: msg, system: false, fromStranger: true }]);
    });

    socket.on('partner-disconnected', () => {
      setConnected(false);
      setMessages((prev) => [...prev, { text: 'Partner disconnected.', system: true }]);
    });

    return () => {
      socket.off('waiting');
      socket.off('partner-found');
      socket.off('chat-message');
      socket.off('partner-disconnected');
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit('chat-message', input);
      setMessages((prev) => [...prev, { text: input, system: false, fromStranger: false }]);
      setInput('');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>💬 Chat</h2>
      <div style={{ border: '1px solid #ccc', height: 300, overflowY: 'auto', padding: 10 }}>
        {messages.map((msg, i) => (
          <p key={i} style={{ color: msg.system ? '#888' : msg.fromStranger ? 'blue' : 'green' }}>
            {msg.system ? msg.text : (msg.fromStranger ? 'Stranger: ' : 'You: ') + msg.text}
          </p>
        ))}
      </div>
      {connected && (
        <div style={{ marginTop: 10 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            style={{ width: '80%', marginRight: 10 }}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
