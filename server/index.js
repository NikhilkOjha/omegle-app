import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { addToQueue, removeFromQueue, getMatch, isInQueue } from './utils/matchManager.js';

dotenv.config();

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['https://omegle-app.vercel.app'],
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('🟢 New user connected:', socket.id);

  // Match on connect
  tryToMatch(socket);

  // Signaling events
  socket.on('offer', (data) => {
    if (socket.partner) {
      socket.partner.emit('offer', data);
    }
  });

  socket.on('answer', (data) => {
    if (socket.partner) {
      socket.partner.emit('answer', data);
    }
  });

  socket.on('ice-candidate', (candidate) => {
    if (socket.partner) {
      socket.partner.emit('ice-candidate', candidate);
    }
  });

  // Chat message forwarding
  socket.on('sendMessage', (msg) => {
    if (socket.partner) {
      socket.partner.emit('receiveMessage', msg);
    }
  });

  // Handle skip
  socket.on('skipPartner', () => {
    console.log(`🔁 ${socket.id} skipped their partner`);
    disconnectPartner(socket, true);
    tryToMatch(socket); // Try to find a new one
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
    disconnectPartner(socket, false);
    removeFromQueue(socket);
  });

  // Utility functions
  function tryToMatch(socket) {
    if (isInQueue(socket)) return;

    const partner = getMatch(socket);

    if (partner) {
      socket.partner = partner;
      partner.partner = socket;

      socket.emit('partnerFound');
      partner.emit('partnerFound');

      socket.emit('ready');
      partner.emit('ready');
    } else {
      addToQueue(socket);
    }
  }

  function disconnectPartner(socket, notify = true) {
    const partner = socket.partner;
    if (partner) {
      partner.partner = null;
      socket.partner = null;

      if (notify) {
        partner.emit('partnerDisconnected');
      }

      addToQueue(partner); // Requeue the partner if they didn't skip
    }
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
