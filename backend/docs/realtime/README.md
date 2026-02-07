# ⚡ **Real-time Features Documentation**

## 📋 **Overview**

Quad implements real-time functionality using Socket.IO for chat, notifications, and feed updates.

The authoritative, code-accurate event/room specification is:

- `backend/docs/REALTIME_SPEC.md`

---

## 🏗️ **Real-time Architecture**

### **Socket.IO Setup**

```
Client (Frontend) ←→ Socket.IO Server ←→ Backend API ←→ Database
```

### **Core Components**

- **Socket server**: created in `backend/src/server.ts` and stored via `setSocketIO(...)`
- **Socket handlers**:
  - `backend/src/sockets/chat.socket.ts`
  - `backend/src/sockets/notification.socket.ts`

## ⚙️ **Configuration**

Socket.IO configuration is set in `backend/src/server.ts` (transports, ping settings, CORS via `getSocketCorsOptions`).

---

## Current capabilities (as implemented)

### Chat

- Typing indicators:
  - `chat:typing:start`
  - `chat:typing:stop`
- Message lifecycle broadcasts (emitted globally by `backend/src/services/chat.service.ts`):
  - `chat:message:new`
  - `chat:message:edited`
  - `chat:message:deleted`

There is no server-side conversation/thread model, presence system, message reactions, or read receipts.

### Notifications

- Room join/leave:
  - `notification:join` / `notification:leave` with payload `userId: string`
- On join, server emits best-effort `notification:unread_count`.
- Authoritative notification events are emitted from `backend/src/utils/notification.util.ts` using `io.to(userId)`.

### Feed

- Room join/leave:
  - `feed:join` / `feed:leave` with payload `userId: string`
- Feed events are emitted globally via `io.emit(...)`:
  - `feed:new-content`
  - `feed:engagement-update`
  - `feed:content-deleted`
