let waitingUsers = [];

export function addToQueue(socket) {
  waitingUsers.push(socket);
}

export function getMatch(socket) {
  if (waitingUsers.length === 0) return null;

  const partner = waitingUsers.find(s => s !== socket);
  if (!partner) return null;

  waitingUsers = waitingUsers.filter(s => s !== partner);
  return partner;
}
