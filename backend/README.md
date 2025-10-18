# Quad Backend - API Server

Backend server for the Quad Student Social Platform, built with Node.js, Express, TypeScript, MongoDB, and Socket.IO.

## Features

- **RESTful API** with Express.js and TypeScript
- **Real-time updates** with Socket.IO
- **JWT Authentication** for secure user sessions
- **MongoDB** with Mongoose for data persistence
- **Cloudinary** integration for media uploads
- **Anonymous confessions** with generated identities
- **Global chat**, **posts**, **polls**, and **confessions**

## Tech Stack

- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **Cloudinary** for file storage
- **bcryptjs** for password hashing

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database and Cloudinary configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth and file upload middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── sockets/         # Socket.IO event handlers
│   ├── utils/           # Utility functions
│   └── server.ts        # Main entry point
├── package.json
├── tsconfig.json
└── .env
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for media uploads)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/quad
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   CLIENT_URL=http://localhost:5173
   ```

   **Note:** Replace the Cloudinary credentials with your actual values from [Cloudinary Dashboard](https://cloudinary.com/console).

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Posts
- `GET /api/posts` - Get all posts (protected)
- `POST /api/posts` - Create a new post (protected)
- `POST /api/posts/:id/like` - Like/unlike a post (protected)
- `POST /api/posts/:id/comment` - Add comment to post (protected)
- `GET /api/posts/:id/comments` - Get comments for a post (protected)

### Polls
- `GET /api/polls` - Get all polls (protected)
- `POST /api/polls` - Create a new poll (protected)
- `POST /api/polls/:id/vote` - Vote on a poll (protected)

### Confessions
- `GET /api/confessions` - Get all confessions (public)
- `POST /api/confessions` - Create a new confession (public/anonymous)
- `POST /api/confessions/:id/like` - Like/unlike a confession (public/anonymous)
- `POST /api/confessions/:id/thought` - Add thought to confession (public/anonymous)

### Chat
- `GET /api/chat/messages` - Get chat messages (protected)
- `POST /api/chat/messages` - Send a chat message (protected)

### Users
- `GET /api/users/:username` - Get user profile (protected)
- `PUT /api/users/me/profile-picture` - Update profile picture (protected)

## Socket.IO Events

### Client → Server
- `send_chat_message` - Send a chat message

### Server → Client
- `new_post` - New post created
- `update_post_likes` - Post likes updated
- `new_comment` - New comment added
- `new_poll` - New poll created
- `update_poll_votes` - Poll votes updated
- `new_confession` - New confession created
- `update_confession_likes` - Confession likes updated
- `new_thought` - New thought added to confession
- `new_chat_message` - New chat message

## Database Models

- **User**: Username, email, password, profile picture
- **Post**: Media (image/video), caption, author, likes
- **Comment**: Content, author, post reference
- **Poll**: Question, options with votes, optional media
- **Confession**: Anonymous content, likes, thoughts
- **ChatMessage**: Content, author, optional media

## License

MIT
