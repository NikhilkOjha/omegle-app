// server/utils/matchManager.js

// Store unmatched sockets in a queue
const queue = new Set();

/**
 * Add a user to the matchmaking queue
 */
export function addToQueue(socket) {
  queue.add(socket);
}

/**
 * Remove a user from the matchmaking queue
 */
export function removeFromQueue(socket) {
  queue.delete(socket);
}

/**
 * Check if the socket is already in the queue
 */
export function isInQueue(socket) {
  return queue.has(socket);
}

/**
 * Find a match for a socket
 */
export function getMatch(socket) {
  for (let partner of queue) {
    if (partner !== socket) {
      queue.delete(partner);
      return partner;
    }
  }

  return null;
}

export { queue };
