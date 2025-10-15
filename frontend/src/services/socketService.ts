import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../store/authStore";

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect() {
    const token = useAuthStore.getState().token;

    if (!token) {
      console.error("No authentication token found");
      return;
    }

    this.socket = io(import.meta.env.VITE_API_URL.replace("/api", ""), {
      auth: { token },
    });

    this.socket.on("connect", () => {
      console.log("🔌 Connected to WebSocket");
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    this.socket.on("disconnect", () => {
      console.log("🔌 Disconnected from WebSocket");
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Post events
  subscribeToNewPosts(callback: (post: any) => void) {
    this.socket?.on("post:new", callback);
  }

  subscribeToPostReactions(
    callback: (data: {
      postId: string;
      reaction: string;
      userId: string;
    }) => void
  ) {
    this.socket?.on("post:reaction", callback);
  }

  subscribeToNewComments(
    callback: (data: { postId: string; comment: any }) => void
  ) {
    this.socket?.on("post:newComment", callback);
  }

  // Poll events
  subscribeToPollUpdates(pollId: string, callback: (results: any) => void) {
    this.socket?.on(`poll:${pollId}:update`, callback);
  }

  // Confession events
  subscribeToNewConfessions(callback: (confession: any) => void) {
    this.socket?.on("confession:new", callback);
  }

  // User events
  subscribeToUserTyping(
    callback: (data: { userId: string }) => void
  ) {
    this.socket?.on("user:typing", callback);
  }

  // Emit events
  emitPostCreate(postData: any) {
    this.socket?.emit("post:create", postData);
  }

  emitPostReact(postId: string, reaction: string, userId: string) {
    this.socket?.emit("post:react", { postId, reaction, userId });
  }

  emitPostComment(postId: string, comment: any) {
    this.socket?.emit("post:comment", { postId, comment });
  }

  emitPollVote(pollId: string, option: string, results: any) {
    this.socket?.emit("poll:vote", { pollId, option, results });
  }

  emitConfessionCreate(confession: any) {
    this.socket?.emit("confession:create", confession);
  }

  emitUserTyping(postId: string) {
    this.socket?.emit("user:typing", { postId });
  }

  joinPostRoom(postId: string) {
    this.socket?.emit("post:view", postId);
  }

  leavePostRoom(postId: string) {
    this.socket?.emit("post:leave", postId);
  }
}

export const socketService = SocketService.getInstance();
