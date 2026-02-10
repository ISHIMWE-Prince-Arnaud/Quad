import { create } from "zustand";
import { type Socket } from "socket.io-client";

interface SocketState {
  socket: Socket | null;
  setSocket: (socket: Socket | null) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  socket: null,
  setSocket: (socket) => set({ socket }),
}));
