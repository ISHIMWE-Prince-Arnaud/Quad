import type { Server, Socket } from "socket.io";

/**
 * Setup notification socket handlers
 */
export const setupNotificationSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    // Join user's personal notification room
    socket.on("notification:join", (userId: string) => {
      if (userId) {
        socket.join(userId);
        console.log(`User ${userId} joined notification room`);
      }
    });

    // Leave user's personal notification room
    socket.on("notification:leave", (userId: string) => {
      if (userId) {
        socket.leave(userId);
        console.log(`User ${userId} left notification room`);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      // Socket.IO automatically removes socket from all rooms on disconnect
    });
  });
};
