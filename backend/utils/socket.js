const { Server } = require("socket.io");

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Allow all origins for dev flexibility
      methods: ["GET", "POST", "PUT", "DELETE"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Client Connected to WebSockets: ${socket.id}`);

    // Join specific rooms based on user role or block
    socket.on("join", (data) => {
      if (data?.role) {
        socket.join(`role:${data.role}`);
        console.log(`👤 Socket ${socket.id} joined room: role:${data.role}`);
      }
      if (data?.block) {
        socket.join(`block:${data.block}`);
        console.log(`🏢 Socket ${socket.id} joined room: block:${data.block}`);
      }
      if (data?.userId) {
        socket.join(`user:${data.userId}`);
        console.log(`🔑 Socket ${socket.id} joined room: user:${data.userId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client Disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized!");
  }
  return io;
};

// --- EMITTERS ---

const emitComplaintCreated = (complaint) => {
  if (!io) return;
  // Broadcast to all admins and wardens
  io.to("role:admin").emit("complaint:created", complaint);
  if (complaint.block) {
    io.to(`block:${complaint.block}`).emit("complaint:created", complaint);
  }
  io.emit("complaint:created", complaint); // General broadcast for live UI refetch
};

const emitComplaintUpdated = (complaint) => {
  if (!io) return;
  io.to("role:admin").emit("complaint:updated", complaint);
  if (complaint.student?._id || complaint.student) {
    const studentId = complaint.student._id || complaint.student;
    io.to(`user:${studentId}`).emit("complaint:updated", complaint);
  }
  if (complaint.block) {
    io.to(`block:${complaint.block}`).emit("complaint:updated", complaint);
  }
  io.emit("complaint:updated", complaint);
};

const emitCriticalAlert = (complaint) => {
  if (!io) return;
  io.to("role:admin").emit("complaint:critical", complaint);
  if (complaint.block) {
    io.to(`block:${complaint.block}`).emit("complaint:critical", complaint);
  }
  io.emit("complaint:critical", complaint);
};

module.exports = {
  initSocket,
  getIO,
  emitComplaintCreated,
  emitComplaintUpdated,
  emitCriticalAlert
};
