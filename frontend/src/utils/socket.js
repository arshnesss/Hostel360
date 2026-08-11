import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Connect to backend Socket.io server
export const socket = io(API_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});

export const joinSocketRoom = (user) => {
  if (user) {
    socket.emit("join", {
      role: user.role,
      block: user.block,
      userId: user._id,
    });
  }
};
