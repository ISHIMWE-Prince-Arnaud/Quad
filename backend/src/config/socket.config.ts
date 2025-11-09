import { Server as SocketIOServer } from "socket.io";

// Export a reference that will be set after server initialization
let io: SocketIOServer;

export const setSocketIO = (socketInstance: SocketIOServer) => {
  io = socketInstance;
};

export const getSocketIO = (): SocketIOServer => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized yet");
  }
  return io;
};
