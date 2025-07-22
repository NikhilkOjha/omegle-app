// client/src/socket.js
import { io } from "socket.io-client";

// Connect to your backend
const socket = io("https://omegle-app-0887.onrender.com", ('http://localhost:5000'), {
  transports: ["websocket"],
  autoConnect: true,
});

export default socket;
