import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import {
  addToQueue,
  removeFromQueue,
  getMatch,
  isInQueue,
  queue
} from './utils/matchManager.js';

dotenv.config();

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['https://omegle-app.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('🟢 New user connected:', socket.id);

  tryToMatch(socket);

  // WebRTC signaling
  socket.on('offer', (data) => {
    socket.partner?.emit('offer', data);
  });

  socket.on('answer', (data) => {
    socket.partner?.emit('answer', data);
  });

  socket.on('ice-candidate', (candidate) => {
    socket.partner?.emit('ice-candidate', candidate);
  });

  // Chat message relay
  socket.on('sendMessage', (msg) => {
    socket.partner?.emit('receiveMessage', msg);
  });

  // Skip current partner and find a new one
  socket.on('skipPartner', () => {
    console.log(`🔁 ${socket.id} skipped their partner`);
    disconnectPartner(socket, true);
    tryToMatch(socket);
  });

  // Disconnect cleanup
  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
    disconnectPartner(socket, false);
    removeFromQueue(socket);
  });

  // Matching logic
  function tryToMatch(socket) {
    if (isInQueue(socket)) return;

    const partner = getMatch(socket);

    if (partner) {
      socket.partner = partner;
      partner.partner = socket;

      console.log(`🔗 Matched: ${socket.id} <--> ${partner.id}`);

      socket.emit('partnerFound');
      partner.emit('partnerFound');

      socket.emit('ready');
      partner.emit('ready');
    } else {
      addToQueue(socket);
      console.log(`⏳ Added to queue: ${socket.id}`);
    }
  }

  // Disconnect and optionally requeue
  function disconnectPartner(socket, notify = true) {
    const partner = socket.partner;

    if (partner) {
      partner.partner = null;
      socket.partner = null;

      if (notify) {
        partner.emit('partnerDisconnected');
      }

      if (partner.connected) {
        addToQueue(partner);
        console.log(`♻️ Requeued partner: ${partner.id}`);
      }
    }
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
