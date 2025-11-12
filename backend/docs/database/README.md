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

## 📊 **Core Models**

### **1. User Model** (`User.model.ts`)
```typescript
interface IUserDocument {
  clerkId: string;        // Clerk authentication ID
  username: string;       // Unique username
  email: string;         // User email
  displayName?: string;  // Display name
  bio?: string;          // User biography
  profileImage?: string; // Profile image URL
  isVerified: boolean;   // Verification status
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `clerkId` (unique)
- `username` (unique) 
- `email` (unique)
- Text index on `username`, `displayName` for search

**Relationships:**
- One-to-many with Posts, Stories, Polls
- Many-to-many with Follow (as follower/following)
- One-to-many with Comments, Reactions

---

### **2. Post Model** (`Post.model.ts`)
```typescript
interface IPostDocument {
  userId: string;           // Reference to User (clerkId)
  content: string;          // Post content
  mediaUrls?: string[];     // Array of media URLs
  mediaTypes?: string[];    // Types: 'image' | 'video'
  aspectRatios?: string[];  // Media aspect ratios
  likesCount: number;       // Cached likes count
  commentsCount: number;    // Cached comments count
  sharesCount: number;      // Cached shares count
  tags?: string[];          // Hashtags
  mentions?: string[];      // User mentions
  isArchived: boolean;      // Archive status
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `userId` (compound with createdAt)
- `createdAt` (descending)
- Text index on `content`, `tags` for search
- `isArchived` (sparse index)

**Relationships:**
- Many-to-one with User
- One-to-many with Comments, Reactions

---

### **3. Story Model** (`Story.model.ts`)
```typescript
interface IStoryDocument {
  userId: string;          // Reference to User (clerkId)
  title: string;           // Story title
  content: string;         // Story content (rich text)
  excerpt?: string;        // Auto-generated excerpt
  coverImage?: string;     // Cover image URL
  mediaUrls?: string[];    // Additional media
  tags?: string[];         // Story tags
  status: 'draft' | 'published' | 'archived';
  readingTime?: number;    // Estimated reading time
  viewsCount: number;      // View count
  likesCount: number;      // Likes count
  commentsCount: number;   // Comments count
  publishedAt?: Date;      // Publication date
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `userId` (compound with status)
- `status` (compound with publishedAt)
- `publishedAt` (descending)
- Text index on `title`, `content`, `tags`

---

### **4. Poll Model** (`Poll.model.ts`)
```typescript
interface IPollDocument {
  userId: string;              // Reference to User (clerkId)
  question: string;            // Poll question
  options: IPollOption[];      // Poll options
  description?: string;        // Poll description
  mediaUrl?: string;          // Optional media
  settings: IPollSettings;     // Poll configuration
  totalVotes: number;         // Total vote count
  status: 'active' | 'closed' | 'expired';
  expiresAt?: Date;           // Expiration date
  createdAt: Date;
  updatedAt: Date;
}

interface IPollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

interface IPollSettings {
  allowMultiple: boolean;
  showResults: 'after_vote' | 'after_close' | 'always';
  anonymous: boolean;
}
```

**Indexes:**
- `userId` (compound with status)
- `status` (compound with expiresAt)
- `expiresAt` (TTL index for auto-cleanup)
- Text index on `question`, `description`

---

### **5. Comment Model** (`Comment.model.ts`)
```typescript
interface ICommentDocument {
  userId: string;           // Reference to User (clerkId)
  contentType: 'post' | 'story' | 'poll';
  contentId: string;        // Reference to content
  parentId?: string;        // Parent comment (for replies)
  content: string;          // Comment text
  mediaUrl?: string;        // Optional media
  likesCount: number;       // Likes count
  repliesCount: number;     // Replies count
  isEdited: boolean;        // Edit status
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `contentType` + `contentId` (compound)
- `userId` (compound with createdAt)
- `parentId` (sparse index)
- Text index on `content`

---

### **6. Reaction Model** (`Reaction.model.ts`)
```typescript
interface IReactionDocument {
  userId: string;           // Reference to User (clerkId)
  contentType: 'post' | 'story' | 'poll' | 'comment';
  contentId: string;        // Reference to content
  type: 'like' | 'love' | 'laugh' | 'angry' | 'sad';
  createdAt: Date;
}
```

**Indexes:**
- `userId` + `contentType` + `contentId` (unique compound)
- `contentType` + `contentId` (compound)
- `type` (for analytics)

---

### **7. Follow Model** (`Follow.model.ts`)
```typescript
interface IFollowDocument {
  followerId: string;       // User who follows (clerkId)
  followingId: string;      // User being followed (clerkId)
  createdAt: Date;
}
```

**Indexes:**
- `followerId` + `followingId` (unique compound)
- `followerId` (compound with createdAt)
- `followingId` (compound with createdAt)

---

### **8. ChatMessage Model** (`ChatMessage.model.ts`)
```typescript
interface IChatMessageDocument {
  senderId: string;         // Sender User (clerkId)
  receiverId: string;       // Receiver User (clerkId)
  content?: string;         // Message text
  mediaUrl?: string;        // Media attachment
  mediaType?: 'image' | 'video' | 'file';
  messageType: 'text' | 'media' | 'system';
  isEdited: boolean;        // Edit status
  isDeleted: boolean;       // Soft delete
  readAt?: Date;           // Read timestamp
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `senderId` + `receiverId` (compound with createdAt)
- `receiverId` (compound with readAt)
- `createdAt` (descending)

---

### **9. Notification Model** (`Notification.model.ts`)
```typescript
interface INotificationDocument {
  userId: string;           // Recipient User (clerkId)
  actorId?: string;         // User who triggered notification
  type: 'like' | 'comment' | 'follow' | 'mention' | 'post' | 'message';
  contentType?: 'post' | 'story' | 'poll' | 'comment';
  contentId?: string;       // Related content ID
  message: string;          // Notification message
  isRead: boolean;          // Read status
  createdAt: Date;
}
```

**Indexes:**
- `userId` (compound with isRead, createdAt)
- `isRead` (sparse index)
- `createdAt` (TTL index for cleanup)

---

### **10. SearchHistory Model** (`SearchHistory.model.ts`)
```typescript
interface ISearchHistoryDocument {
  userId: string;           // User who searched (clerkId)
  query: string;            // Search query
  searchType: 'users' | 'posts' | 'stories' | 'polls' | 'global';
  resultsCount: number;     // Number of results
  filters?: any;            // Applied filters
  createdAt: Date;
}
```

**Indexes:**
- `userId` (compound with createdAt)
- `query` (text index)
- `createdAt` (TTL index - 90 days)

---

## 🔗 **Relationships Overview**

### **User Relationships**
```
User (1) -----> (∞) Posts
User (1) -----> (∞) Stories  
User (1) -----> (∞) Polls
User (1) -----> (∞) Comments
User (1) -----> (∞) Reactions
User (∞) <----> (∞) Follow (self-referencing)
User (1) -----> (∞) ChatMessages (as sender)
User (1) -----> (∞) ChatMessages (as receiver)
User (1) -----> (∞) Notifications
```

### **Content Relationships**
```
Post (1) -----> (∞) Comments
Post (1) -----> (∞) Reactions
Story (1) -----> (∞) Comments
Story (1) -----> (∞) Reactions
Poll (1) -----> (∞) Comments
Poll (1) -----> (∞) Reactions
Poll (1) -----> (∞) PollVotes
Comment (1) -----> (∞) Comments (replies)
Comment (1) -----> (∞) Reactions
```

---

## 📈 **Performance Optimizations**

### **Indexing Strategy**
1. **Compound Indexes** for common query patterns
2. **Text Indexes** for search functionality
3. **TTL Indexes** for automatic data cleanup
4. **Sparse Indexes** for optional fields

### **Query Optimizations**
1. **Aggregation Pipelines** for complex queries
2. **Population Strategy** to prevent N+1 queries
3. **Projection** to limit returned fields
4. **Pagination** with cursor-based approach

### **Caching Strategy**
1. **Counter Caching** (likes, comments, follows)
2. **Computed Fields** (reading time, excerpts)
3. **Denormalization** for frequently accessed data

---

## 🔧 **Database Utilities**

### **Connection Management**
```typescript
// config/db.config.ts
- Connection pooling
- Retry mechanisms
- Health checks
- Graceful shutdown
```

### **Index Management**
```typescript
// utils/indexes.util.ts
- Automatic index creation
- Index monitoring
- Performance analysis
```

### **Migration Support**
```typescript
// migrations/
- Schema migrations
- Data transformations
- Version control
```

---

## 🛡️ **Data Validation**

### **Mongoose Schemas**
- Built-in validation rules
- Custom validators
- Pre/post middleware hooks
- Virtual fields

### **Zod Integration**
- Request validation
- Response serialization
- Type safety
- Error handling

---

## 📊 **Database Monitoring**

### **Metrics to Track**
- Query performance
- Index usage
- Connection pool status
- Storage usage
- Slow queries

### **Tools**
- MongoDB Compass
- MongoDB Atlas monitoring
- Custom logging
- Performance profiling

---

## 🔄 **Backup & Recovery**

### **Backup Strategy**
- Automated daily backups (MongoDB Atlas)
- Point-in-time recovery
- Cross-region replication
- Local development snapshots

### **Recovery Procedures**
- Database restoration steps
- Data integrity checks
- Rollback procedures
- Disaster recovery plan

---

## 📝 **Best Practices**

### **Schema Design**
1. Embed vs Reference decision matrix
2. Avoid deep nesting (max 3 levels)
3. Use appropriate data types
4. Plan for scalability

### **Query Patterns**
1. Use indexes effectively
2. Limit document size (16MB max)
3. Batch operations when possible
4. Monitor query performance

### **Data Consistency**
1. Use transactions for related operations
2. Implement optimistic locking
3. Handle concurrent updates
4. Validate data integrity

---

This database schema supports a scalable social media platform with optimized performance, proper relationships, and comprehensive indexing for fast queries.
