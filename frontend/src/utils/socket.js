import { io } from "socket.io-client";

// Connect to backend Socket.io server
export const socket = io("http://localhost:5000", {
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
