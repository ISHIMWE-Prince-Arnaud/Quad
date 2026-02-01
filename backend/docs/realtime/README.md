# ⚡ **Real-time Features Documentation**

## 📋 **Overview**

Quad implements real-time functionality using Socket.IO, providing instant chat messaging, live notifications, real-time feed updates, and typing indicators. This document covers the complete real-time implementation.

---

## 🏗️ **Real-time Architecture**

### **Socket.IO Setup**

```
Client (Frontend) ←→ Socket.IO Server ←→ Backend API ←→ Database
```

### **Core Components**

- **Socket Server**: Main Socket.IO server configuration
- **Socket Handlers**: Event handlers for different features
- **Room Management**: User rooms and channels
- **Event Broadcasting**: Real-time event distribution

---

## ⚙️ **Configuration**

### **Socket Server Setup** (`config/socket.config.ts`)

```typescript
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";

export const setupSocketIO = (app: Express) => {
  const server = createServer(app);

  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["polling", "websocket"],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  return { server, io };
};
```

### **Socket Authentication Middleware**

```typescript
import { clerkClient } from "@clerk/express";

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const user = await clerkClient.verifyToken(token);

    socket.userId = user.sub;
    socket.join(`user:${user.sub}`); // Join user-specific room

    next();
  } catch (error) {
    next(new Error("Authentication failed"));
  }
});
```

---

## 💬 **Chat System**

### **Chat Socket Handler** (`sockets/chat.socket.ts`)

```typescript
export const setupChatSocket = (io: SocketIOServer) => {
  io.on("connection", (socket) => {
    // Join chat room
    socket.on("chat:join", async ({ receiverId }) => {
      const chatRoom = getChatRoomId(socket.userId, receiverId);
      await socket.join(chatRoom);

      socket.emit("chat:joined", { room: chatRoom });
      logger.socket(`User ${socket.userId} joined chat room ${chatRoom}`);
    });

    // Send message
    socket.on("chat:message", async (data) => {
      const { receiverId, content, mediaUrl, messageType } = data;

      try {
        // Save message to database
        const message = await ChatMessage.create({
          senderId: socket.userId,
          receiverId,
          content,
          mediaUrl,
          messageType: messageType || "text",
        });

        // Populate sender data
        await message.populate("sender", "username displayName profileImage");

        const chatRoom = getChatRoomId(socket.userId, receiverId);

        // Broadcast to chat room
        io.to(chatRoom).emit("chat:message", {
          ...message.toObject(),
          chatRoom,
        });

        // Send notification to receiver if offline
        const receiverSocket = getUserSocket(receiverId);
        if (!receiverSocket) {
          await createNotification({
            userId: receiverId,
            actorId: socket.userId,
            type: "message",
            message: `New message from ${message.sender.displayName}`,
          });
        }
      } catch (error) {
        socket.emit("chat:error", {
          message: "Failed to send message",
          error: error.message,
        });
      }
    });

    // Typing indicator
    socket.on("chat:typing", ({ receiverId, isTyping }) => {
      const chatRoom = getChatRoomId(socket.userId, receiverId);
      socket.to(chatRoom).emit("chat:typing", {
        senderId: socket.userId,
        isTyping,
      });
    });

    // Message reactions
    socket.on("chat:reaction", async ({ messageId, reaction }) => {
      try {
        const messageReaction = await MessageReaction.findOneAndUpdate(
          { messageId, userId: socket.userId },
          { reaction },
          { upsert: true, new: true },
        );

        const message = await ChatMessage.findById(messageId);
        const chatRoom = getChatRoomId(message.senderId, message.receiverId);

        io.to(chatRoom).emit("chat:reaction", {
          messageId,
          userId: socket.userId,
          reaction,
          reactionId: messageReaction._id,
        });
      } catch (error) {
        socket.emit("chat:error", {
          message: "Failed to add reaction",
        });
      }
    });

    // Mark messages as read
    socket.on("chat:read", async ({ messageIds, senderId }) => {
      try {
        await ChatMessage.updateMany(
          {
            _id: { $in: messageIds },
            receiverId: socket.userId,
            senderId,
          },
          { readAt: new Date() },
        );

        const chatRoom = getChatRoomId(socket.userId, senderId);
        socket.to(chatRoom).emit("chat:read", {
          messageIds,
          readBy: socket.userId,
          readAt: new Date(),
        });
      } catch (error) {
        logger.error("Failed to mark messages as read", error);
      }
    });
  });
};

// Helper function to generate consistent room IDs
const getChatRoomId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join(":");
};
```

---

## 🔔 **Notification System**

### **Notification Socket Handler** (`sockets/notification.socket.ts`)

```typescript
export const setupNotificationSocket = (io: SocketIOServer) => {
  io.on("connection", (socket) => {
    // Mark notification as read
    socket.on("notification:read", async ({ notificationId }) => {
      try {
        await Notification.findByIdAndUpdate(notificationId, {
          isRead: true,
        });

        socket.emit("notification:read", { notificationId });
      } catch (error) {
        logger.error("Failed to mark notification as read", error);
      }
    });

    // Mark all notifications as read
    socket.on("notification:readAll", async () => {
      try {
        await Notification.updateMany(
          { userId: socket.userId, isRead: false },
          { isRead: true },
        );

        socket.emit("notification:readAll", { success: true });
      } catch (error) {
        logger.error("Failed to mark all notifications as read", error);
      }
    });

    // Get unread count
    socket.on("notification:getUnreadCount", async () => {
      try {
        const count = await Notification.countDocuments({
          userId: socket.userId,
          isRead: false,
        });

        socket.emit("notification:unreadCount", { count });
      } catch (error) {
        logger.error("Failed to get unread count", error);
      }
    });
  });
};

// Utility function to send notifications
export const emitNotification = (
  io: SocketIOServer,
  notification: INotificationDocument,
) => {
  io.to(`user:${notification.userId}`).emit("notification:new", notification);
};
```

---

## 📰 **Feed Updates**

### **Feed Socket Handler** (`sockets/feed.socket.ts`)

```typescript
export const setupFeedSocket = (io: SocketIOServer) => {
  io.on("connection", (socket) => {
    // Join feed room based on user's following
    socket.on("feed:join", async () => {
      try {
        const following = await Follow.find({
          followerId: socket.userId,
        }).select("followingId");

        // Join rooms for users they follow
        following.forEach((follow) => {
          socket.join(`feed:${follow.followingId}`);
        });

        // Join general feed room
        socket.join("feed:general");

        socket.emit("feed:joined", {
          rooms: following.length + 1,
        });
      } catch (error) {
        logger.error("Failed to join feed rooms", error);
      }
    });

    // Real-time post updates
    socket.on("feed:newPost", (postData) => {
      // Broadcast to followers
      socket.to(`feed:${socket.userId}`).emit("feed:newPost", postData);

      // Broadcast to general feed
      socket.to("feed:general").emit("feed:newPost", postData);
    });

    // Live reaction updates
    socket.on("feed:reaction", ({ postId, reaction, count }) => {
      io.emit("feed:reactionUpdate", {
        postId,
        reaction,
        count,
        timestamp: new Date(),
      });
    });

    // Live comment updates
    socket.on("feed:comment", ({ postId, comment }) => {
      io.emit("feed:newComment", {
        postId,
        comment,
        timestamp: new Date(),
      });
    });
  });
};

// Broadcast new content to feeds
export const broadcastToFeeds = (
  io: SocketIOServer,
  userId: string,
  content: any,
) => {
  // Emit to user's followers
  io.to(`feed:${userId}`).emit("feed:update", content);

  // Emit to general feed
  io.to("feed:general").emit("feed:update", content);
};
```

---

## 👥 **User Presence System**

### **Presence Tracking**

```typescript
const userPresence = new Map<
  string,
  {
    socketId: string;
    status: "online" | "away" | "offline";
    lastSeen: Date;
  }
>();

export const setupPresenceSocket = (io: SocketIOServer) => {
  io.on("connection", (socket) => {
    // User comes online
    socket.on("presence:online", () => {
      userPresence.set(socket.userId, {
        socketId: socket.id,
        status: "online",
        lastSeen: new Date(),
      });

      // Broadcast to friends
      socket.broadcast.emit("presence:userOnline", {
        userId: socket.userId,
        status: "online",
      });
    });

    // User goes away
    socket.on("presence:away", () => {
      const presence = userPresence.get(socket.userId);
      if (presence) {
        presence.status = "away";
        presence.lastSeen = new Date();
      }

      socket.broadcast.emit("presence:userAway", {
        userId: socket.userId,
        status: "away",
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      const presence = userPresence.get(socket.userId);
      if (presence) {
        presence.status = "offline";
        presence.lastSeen = new Date();
      }

      socket.broadcast.emit("presence:userOffline", {
        userId: socket.userId,
        status: "offline",
        lastSeen: new Date(),
      });
    });

    // Get user presence
    socket.on("presence:get", ({ userIds }) => {
      const presenceData = userIds.map((userId) => ({
        userId,
        ...(userPresence.get(userId) || { status: "offline" }),
      }));

      socket.emit("presence:data", presenceData);
    });
  });
};
```

---

## 🎯 **Event Broadcasting Utilities**

### **Notification Broadcasting**

```typescript
// utils/socketBroadcast.util.ts
import { getSocketIO } from "../config/socket.config.js";

export const broadcastNotification = (userId: string, notification: any) => {
  const io = getSocketIO();
  io.to(`user:${userId}`).emit("notification:new", notification);
};

export const broadcastToFollowers = async (
  userId: string,
  event: string,
  data: any,
) => {
  const io = getSocketIO();
  const followers = await Follow.find({ followingId: userId }).select(
    "followerId",
  );

  followers.forEach((follow) => {
    io.to(`user:${follow.followerId}`).emit(event, data);
  });
};

export const broadcastGlobal = (event: string, data: any) => {
  const io = getSocketIO();
  io.emit(event, data);
};
```

---

## 🛡️ **Security & Rate Limiting**

### **Socket Rate Limiting**

```typescript
const socketRateLimit = new Map<
  string,
  {
    count: number;
    resetTime: number;
  }
>();

const RATE_LIMIT = {
  messages: { max: 30, window: 60000 }, // 30 messages per minute
  reactions: { max: 60, window: 60000 }, // 60 reactions per minute
  typing: { max: 10, window: 10000 }, // 10 typing events per 10 seconds
};

export const checkRateLimit = (userId: string, action: string): boolean => {
  const limit = RATE_LIMIT[action];
  if (!limit) return true;

  const key = `${userId}:${action}`;
  const now = Date.now();

  let userLimit = socketRateLimit.get(key);

  if (!userLimit || now > userLimit.resetTime) {
    socketRateLimit.set(key, {
      count: 1,
      resetTime: now + limit.window,
    });
    return true;
  }

  if (userLimit.count >= limit.max) {
    return false;
  }

  userLimit.count++;
  return true;
};
```

### **Message Content Filtering**

```typescript
export const filterMessage = (
  content: string,
): { safe: boolean; filtered: string } => {
  // Basic profanity filter
  const profanityRegex = /badword1|badword2|badword3/gi;
  const filtered = content.replace(profanityRegex, "***");

  return {
    safe: !profanityRegex.test(content),
    filtered,
  };
};
```

---

## 📱 **Frontend Integration Examples**

### **React Socket Connection**

```jsx
import { io } from "socket.io-client";
import { useAuth } from "@clerk/clerk-react";

const useSocket = () => {
  const { getToken } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const initSocket = async () => {
      const token = await getToken();

      const newSocket = io(process.env.REACT_APP_API_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      newSocket.on("connect", () => {
        console.log("Connected to socket server");
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from socket server");
      });

      setSocket(newSocket);
    };

    initSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return socket;
};
```

### **Chat Component Example**

```jsx
const ChatComponent = ({ receiverId }) => {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!socket) return;

    // Join chat room
    socket.emit("chat:join", { receiverId });

    // Listen for new messages
    socket.on("chat:message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for typing indicators
    socket.on("chat:typing", ({ senderId, isTyping }) => {
      // Update typing state
    });

    return () => {
      socket.off("chat:message");
      socket.off("chat:typing");
    };
  }, [socket, receiverId]);

  const sendMessage = () => {
    if (socket && newMessage.trim()) {
      socket.emit("chat:message", {
        receiverId,
        content: newMessage,
        messageType: "text",
      });
      setNewMessage("");
    }
  };

  const handleTyping = (isTyping) => {
    if (socket) {
      socket.emit("chat:typing", { receiverId, isTyping });
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((message) => (
          <MessageComponent key={message._id} message={message} />
        ))}
      </div>

      <input
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onFocus={() => handleTyping(true)}
        onBlur={() => handleTyping(false)}
        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
};
```

---

## 📊 **Performance Monitoring**

### **Socket Metrics**

```typescript
export const trackSocketMetrics = (io: SocketIOServer) => {
  setInterval(() => {
    const metrics = {
      connectedSockets: io.sockets.sockets.size,
      rooms: io.sockets.adapter.rooms.size,
      memoryUsage: process.memoryUsage(),
      timestamp: new Date(),
    };

    logger.info("Socket metrics", metrics);

    // Send to monitoring service
    // monitoringService.track('socket_metrics', metrics);
  }, 60000); // Every minute
};
```

---

## 🔧 **Development & Testing**

### **Socket Testing Helper**

```typescript
// test/socket.helper.ts
import { io as Client } from "socket.io-client";

export const createTestSocket = (token: string) => {
  return Client("http://localhost:3001", {
    auth: { token },
    forceNew: true,
  });
};

export const waitForEvent = (socket: any, event: string, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Event ${event} not received within ${timeout}ms`));
    }, timeout);

    socket.once(event, (data: any) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
};
```

---

## 📝 **Best Practices**

### **Performance Optimization**

1. **Use rooms efficiently** to minimize broadcast overhead
2. **Implement connection pooling** for database operations
3. **Cache frequently accessed data** (user presence, room membership)
4. **Use message queuing** for high-volume events

### **Scalability Considerations**

1. **Redis adapter** for multi-server deployments
2. **Horizontal scaling** with load balancers
3. **Message persistence** for reliability
4. **Graceful degradation** when sockets fail

### **Security Guidelines**

1. **Always authenticate** socket connections
2. **Validate all incoming** socket events
3. **Implement rate limiting** for socket events
4. **Sanitize user content** before broadcasting
5. **Use rooms** to control message visibility

---

This real-time system provides instant communication, live updates, and engaging user interactions while maintaining security, performance, and scalability for a growing social media platform.
