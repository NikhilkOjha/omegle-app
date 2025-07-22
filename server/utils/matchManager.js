// utils/matchManager.js

let waitingUsers = [];

// Add user to waiting queue
export function addToQueue(socket) {
  console.log(`🕒 Added to queue: ${socket.id}`);
  waitingUsers.push(socket);
}

// Match the socket with another available user
export function getMatch(socket) {
  if (waitingUsers.length === 0) {
    return null;
  }

  // Exclude the current socket from matching with itself
  const partner = waitingUsers.find(s => s.id !== socket.id);

  if (!partner) {
    return null;
  }

  // Remove matched partner from queue
  waitingUsers = waitingUsers.filter(s => s.id !== partner.id);

  console.log(`🔗 Matched: ${socket.id} <--> ${partner.id}`);
  return partner;
}

// Remove user from queue on disconnect
export function removeFromQueue(socket) {
  waitingUsers = waitingUsers.filter(s => s.id !== socket.id);
  console.log(`❌ Removed from queue: ${socket.id}`);
}
