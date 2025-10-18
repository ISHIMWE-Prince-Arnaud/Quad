# Quad - Student Social Platform

A modern, real-time social platform for students to share memes, posts, polls, and confessions. Built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO for real-time features.

## 🚀 Features

### Core Features
- **Feed** - Share images and videos with captions, like and comment on posts
- **Polls** - Create polls and "Would You Rather" questions with real-time voting
- **Chat** - Global chat room for all users with real-time messaging
- **Confessions** - Post anonymously with generated identities
- **Profiles** - User profiles with activity tracking and customizable avatars

### Technical Features
- **Real-time updates** with Socket.IO
- **JWT Authentication** for secure sessions
- **Image/Video uploads** via Cloudinary
- **Dark/Light mode** toggle
- **Fully responsive** design
- **Type-safe** with TypeScript

## 📁 Project Structure

```
Quad/
├── backend/         # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── sockets/
│   │   ├── utils/
│   │   └── server.ts
│   ├── package.json
│   └── README.md
│
└── frontend/        # Frontend (React + Vite)
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── services/
    │   ├── types/
    │   ├── utils/
    │   └── App.tsx
    ├── package.json
    └── README.md
```

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **Cloudinary** for media storage
- **bcryptjs** for password hashing

### Frontend
- **React 18** with **TypeScript**
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Socket.IO Client** for real-time updates
- **React Router** for navigation
- **Axios** for API requests
- **Lucide React** for icons

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (for media uploads)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/quad
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   App runs on `http://localhost:5173`

### Database Setup

If using local MongoDB:
```bash
mongod
```

If using MongoDB Atlas:
- Create a cluster
- Get your connection string
- Update `MONGO_URI` in backend `.env`

### Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Add them to your backend `.env` file

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Add comment
- `GET /api/posts/:id/comments` - Get comments

### Polls
- `GET /api/polls` - Get all polls
- `POST /api/polls` - Create poll
- `POST /api/polls/:id/vote` - Vote on poll

### Confessions
- `GET /api/confessions` - Get confessions
- `POST /api/confessions` - Create confession
- `POST /api/confessions/:id/like` - Like confession
- `POST /api/confessions/:id/thought` - Add thought

### Chat
- `GET /api/chat/messages` - Get messages
- `POST /api/chat/messages` - Send message

### Users
- `GET /api/users/:username` - Get user profile
- `PUT /api/users/me/profile-picture` - Update profile picture

## 🔌 Socket.IO Events

### FRONTEND → Server
- `send_chat_message` - Send chat message

### Server → FRONTEND
- `new_post` - New post created
- `update_post_likes` - Post likes updated
- `new_comment` - Comment added
- `new_poll` - Poll created
- `update_poll_votes` - Poll votes updated
- `new_confession` - Confession posted
- `update_confession_likes` - Confession likes updated
- `new_thought` - Thought added
- `new_chat_message` - Chat message sent

## 🎨 Design

- **Primary Color:** Blue (#3b82f6)
- **Default Theme:** Dark mode
- **Typography:** System fonts with Tailwind CSS
- **Icons:** Lucide React

## 📱 Responsive Design

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

## 🔐 Security

- Passwords hashed with bcryptjs
- JWT tokens for authentication
- Environment variables for sensitive data
- Input validation on both frontend and backend
- CORS protection

## 📦 Production Build

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Authors

Built as a comprehensive social platform project.

## 🙏 Acknowledgments

- Socket.IO for real-time capabilities
- Cloudinary for media management
- MongoDB for flexible data storage
- React and Express communities
