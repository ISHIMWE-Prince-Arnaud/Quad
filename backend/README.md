# Quad Backend Server

Backend API server for Quad - Student Social Platform. Built with Node.js, Express.js, TypeScript, MongoDB, and Socket.IO.

## 🚀 Features

- **RESTful API** with Express.js
- **Real-time communication** with Socket.IO
- **JWT Authentication** for secure sessions
- **MongoDB** database with Mongoose ODM
- **File uploads** via Cloudinary
- **TypeScript** for type safety
- **CORS** enabled for frontend communication

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files (DB, Cloudinary)
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Auth & file upload middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API route definitions
│   ├── sockets/         # Socket.IO event handlers
│   ├── utils/           # Utility functions
│   └── server.ts        # Main entry point
├── package.json
├── tsconfig.json
└── .env                 # Environment variables (create from .env.example)
```

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   - `PORT` - Server port (default: 5000)
   - `MONGO_URI` - MongoDB connection string
   - `JWT_SECRET` - Secret key for JWT tokens
   - `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
   - `CLOUDINARY_API_KEY` - Cloudinary API key
   - `CLOUDINARY_API_SECRET` - Cloudinary API secret
   - `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)

3. **Start MongoDB:**
   
   Ensure MongoDB is running locally or use MongoDB Atlas.

4. **Run the server:**
   
   **Development mode** (with auto-restart):
   ```bash
   npm run dev
   ```

   **Production build:**
   ```bash
   npm run build
   npm start
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Posts
- `GET /api/posts` - Get all posts (Protected)
- `POST /api/posts` - Create post with media (Protected)
- `POST /api/posts/:id/like` - Like/unlike post (Protected)
- `POST /api/posts/:id/comment` - Add comment (Protected)
- `GET /api/posts/:id/comments` - Get comments (Protected)

### Polls
- `GET /api/polls` - Get all polls (Protected)
- `POST /api/polls` - Create poll (Protected)
- `POST /api/polls/:id/vote` - Vote on poll (Protected)

### Confessions
- `GET /api/confessions` - Get confessions (Public)
- `POST /api/confessions` - Create confession (Public/Anonymous)
- `POST /api/confessions/:id/like` - Like confession (Public/Anonymous)
- `POST /api/confessions/:id/thought` - Add thought (Public/Anonymous)

### Chat
- `GET /api/chat/messages` - Get chat messages (Protected)
- `POST /api/chat/messages` - Send message (Protected)

### Users
- `GET /api/users/:username` - Get user profile (Protected)
- `PUT /api/users/me/profile-picture` - Update profile picture (Protected)

## 🔌 Socket.IO Events

### Client → Server
- `send_chat_message` - Send a chat message

### Server → Client
- `new_post` - New post created
- `update_post_likes` - Post likes updated
- `new_comment` - New comment added
- `new_poll` - New poll created
- `update_poll_votes` - Poll votes updated
- `new_confession` - New confession posted
- `update_confession_likes` - Confession likes updated
- `new_thought` - New thought added to confession
- `new_chat_message` - New chat message

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. 

**To access protected routes:**
1. Login or register to receive a token
2. Include the token in the Authorization header:
   ```
   Authorization: Bearer <your-token>
   ```

Socket.IO connections also require JWT authentication via the `auth.token` parameter.

## 📦 Dependencies

### Production
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `socket.io` - Real-time communication
- `cloudinary` - Media storage
- `multer` - File upload handling
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `uuid` - Unique ID generation

### Development
- `typescript` - TypeScript compiler
- `ts-node` - TypeScript execution
- `nodemon` - Auto-restart on changes
- `@types/*` - Type definitions

## 🗃️ Database Models

### User
- username, email, password
- profilePicture
- createdAt

### Post
- author, mediaUrl, mediaType
- caption, likes
- createdAt

### Poll
- author, question
- mediaUrl, mediaType (optional)
- options (text, votes array)
- isWouldYouRather
- createdAt

### Comment
- post, author, content
- createdAt

### Confession
- anonymousAuthorId, anonymousUsername, anonymousAvatar
- content, mediaUrl, mediaType
- likes (array of anonymous IDs)
- thoughts (nested array)
- createdAt

### ChatMessage
- author, content
- mediaUrl, mediaType (optional)
- createdAt

## 🔧 Scripts

```bash
npm run dev      # Start development server with nodemon
npm run build    # Compile TypeScript to JavaScript
npm start        # Run compiled JavaScript (production)
```

## 🌐 CORS Configuration

CORS is configured to accept requests from the frontend URL specified in `FRONTEND_URL` environment variable.

## 📝 Notes

- Ensure MongoDB is running before starting the server
- Set strong, unique values for `JWT_SECRET` in production
- Keep your Cloudinary credentials secure
- The server automatically creates database indexes for optimized queries

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Change PORT in .env file or kill the process using the port
```

**Database connection failed:**
```bash
# Check MONGO_URI in .env
# Ensure MongoDB is running
# Verify network access if using MongoDB Atlas
```

**Cloudinary upload errors:**
```bash
# Verify Cloudinary credentials in .env
# Check file size limits
```

## 📄 License

MIT License
