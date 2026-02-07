# 🗄️ **Database Schema Documentation**

## 📋 **Overview**

Quad uses MongoDB with Mongoose ODM for data persistence. This document outlines all database models, relationships, and schema design decisions.

---

## 🏗️ **Database Architecture**

### **Database Configuration**

- **Database**: MongoDB Atlas (Production) / Local MongoDB (Development)
- **ODM**: Mongoose with TypeScript interfaces
- **Connection**: Connection pooling with retry logic
- **Indexes**: Optimized indexes for search and performance

---

## 📊 Model reference (authoritative)

The authoritative schema definitions live in `backend/src/models/*.model.ts`.

### Models

- **[User](./models/user.md)** (`User.model.ts`)
- **[Post](./models/post.md)** (`Post.model.ts`)
- **[Story](./models/story.md)** (`Story.model.ts`)
- **[Poll](./models/poll.md)** (`Poll.model.ts`)
- **[PollVote](./models/poll-vote.md)** (`PollVote.model.ts`)
- **[Comment](./models/comment.md)** (`Comment.model.ts`)
- **[CommentLike](./models/comment-like.md)** (`CommentLike.model.ts`)
- **[Reaction](./models/reaction.md)** (`Reaction.model.ts`)
- **[Follow](./models/follow.md)** (`Follow.model.ts`)
- **[ChatMessage](./models/chat-message.md)** (`ChatMessage.model.ts`)
- **[Bookmark](./models/bookmark.md)** (`Bookmark.model.ts`)
- **[Notification](./models/notification.md)** (`Notification.model.ts`)

### Relationships

- **[Relationships overview](./relationships.md)**
