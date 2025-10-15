# 🏫 Quad - Student Social Platform

**Tagline:** "Where students laugh, share, and vibe together."

Quad is a modern social platform built specifically for students to share memes, funny posts, polls, and anonymous confessions. Think of it as a combination of Instagram, Twitter polls, and a confession board—all in one fun, school-themed app.

---

## 🎯 Features

### Core Features
- **📸 Meme & Media Feed** - Share images and videos with captions and hashtags
- **😂 Emoji Reactions** - React with laugh, cry, love, or angry emojis
- **💬 Comments** - Engage with posts through comments
- **📊 Polls** - Create and vote on community polls
- **🤔 Would You Rather** - Fun two-option decision games
- **🤫 Anonymous Confessions** - Share secrets anonymously
- **🏆 Leaderboard** - Weekly top posts and active users
- **🎭 Weekly Themes** - Participate in themed challenges
- **🌓 Dark Mode** - Full dark/light theme support
- **🔒 JWT Authentication** - Secure user authentication

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Node.js + Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **File Storage:** Cloudinary
- **Security:** Helmet, CORS, express-rate-limit
- **Validation:** express-validator
- **Automation:** node-cron for weekly tasks

### Frontend
- **Framework:** React 18 + TypeScript
- **Styling:** TailwindCSS
- **State Management:** Zustand
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Notifications:** React Toastify
- **Build Tool:** Vite

---

## 📁 Project Structure

```
Quad/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & Cloudinary config
│   │   ├── models/          # MongoDB models
│   │   ├── controllers/     # Route handlers
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Auth, error handling, rate limiting
│   │   ├── utils/           # Helper functions
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── .env.example         # Environment variables template
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable UI components
    │   ├── pages/           # Route pages
    │   ├── store/           # Zustand stores
    │   ├── types/           # TypeScript types
    │   ├── utils/           # Helper functions
    │   ├── App.tsx          # Main app component
    │   ├── main.tsx         # Entry point
    │   └── index.css        # Global styles
    ├── index.html
    ├── vite.config.ts
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or MongoDB Atlas)
- **Cloudinary Account** (for image/video uploads)

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
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables in `.env`:**
   ```env
   NODE_ENV=development
   PORT=5000

   # MongoDB (use local or Atlas URL)
   MONGODB_URI=mongodb://localhost:27017/quad

   # JWT Secret (change this!)
   JWT_SECRET=your_super_secret_jwt_key_change_this
   JWT_EXPIRE=7d

   # Cloudinary Credentials
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Frontend URL
   FRONTEND_URL=http://localhost:5173

   # Rate Limiting
   CONFESSION_RATE_LIMIT=5
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

   Backend will run on `http://localhost:5000`

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
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:5173`

### First Time Setup

1. **Access the app** at `http://localhost:5173`
2. **Register a new account** with your email
3. **Start posting memes!** 🎉

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Posts
- `GET /api/posts` - Get all posts (query: sort, tag, theme)
- `GET /api/posts/top` - Get top posts of the week
- `GET /api/posts/user/:userId` - Get user's posts
- `POST /api/posts` - Create new post (protected, multipart)
- `POST /api/posts/:id/react` - React to post (protected)
- `POST /api/posts/:id/comment` - Add comment (protected)
- `POST /api/posts/:id/report` - Report post (protected)

### Polls
- `GET /api/polls` - Get all polls
- `GET /api/polls/:id` - Get single poll
- `POST /api/polls` - Create poll (protected)
- `POST /api/polls/:id/vote` - Vote on poll (protected)

### Confessions
- `GET /api/confessions` - Get all confessions
- `POST /api/confessions` - Submit confession (rate limited)
- `POST /api/confessions/:id/like` - Like confession
- `POST /api/confessions/:id/report` - Report confession

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard data
- `GET /api/leaderboard/user/:id` - Get user profile with stats

### Themes
- `GET /api/themes` - Get all themes
- `GET /api/themes/current` - Get current active theme
- `POST /api/themes` - Create theme (admin only)

---

## 🎨 UI Design

### Color Scheme
- **Primary Blue:** `#3B82F6`
- **Accent Gold:** `#FACC15`
- **Dark Background:** `#1F2937`
- **Dark Card:** `#374151`

### Key Design Features
- **Responsive Grid Layout** - Mobile-first design
- **Card-based UI** - Modern, Instagram-like cards
- **Smooth Animations** - Hover effects and transitions
- **Dark Mode Support** - System preference detection
- **Emoji Reactions** - Large, visible reaction buttons
- **Trending Sidebar** - Popular hashtags and stats

---

## 🔐 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - Protection against spam
- **XSS Prevention** - Text sanitization
- **CORS Configuration** - Restricted origins
- **Helmet.js** - Security headers
- **Input Validation** - express-validator

---

## 🤖 Automated Tasks

The backend runs weekly cron jobs every Monday at midnight to:

1. **Reset Top Post flags**
2. **Calculate top 10 posts** of the previous week
3. **Award badges** to top contributors:
   - "TopPost" badge for top 3 posts
   - "ActiveUser" badge for users with 10+ posts/week

---

## 🧪 Development Tips

### Backend Development
```bash
# Run in development mode with auto-reload
npm run dev

# Run linter
npm run lint
```

### Frontend Development
```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### MongoDB Setup

**Option 1: Local MongoDB**
```bash
# Install MongoDB locally
# Then connect with:
MONGODB_URI=mongodb://localhost:27017/quad
```

**Option 2: MongoDB Atlas (Recommended)**
1. Create free cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Get connection string
3. Update `.env` with Atlas URL

### Cloudinary Setup
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your credentials from dashboard
3. Add to backend `.env` file

---

## 📱 Features Walkthrough

### Feed Page
- View all posts sorted by newest or top of week
- Filter by hashtags
- Upload new posts with media
- React and comment on posts

### Entertainment Board
- Three tabs: Polls, Would You Rather, Confessions
- Create and vote on polls
- Like and report confessions

### Leaderboard
- Top 5 funniest posts (most laugh reactions)
- Most active users
- Most reacted posts
- Hall of Fame with badge holders

### Profile Page
- View your stats and badges
- See all your posts
- Display your top post

---

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Failed:**
```bash
# Check if MongoDB is running (local)
sudo systemctl status mongod

# Or check Atlas connection string format
```

**Cloudinary Upload Failed:**
- Verify API credentials in `.env`
- Check file size (max 10MB)
- Ensure file type is allowed

### Frontend Issues

**API Requests Failing:**
- Check if backend is running on port 5000
- Verify `VITE_API_URL` in frontend `.env`
- Check browser console for CORS errors

**Dark Mode Not Working:**
- Clear localStorage
- Check if `dark` class is applied to `<html>`

---

## 🚢 Production Deployment

### Backend Deployment (Heroku/Railway/Render)

1. Set environment variables
2. Set `NODE_ENV=production`
3. Update `FRONTEND_URL` to production domain
4. Deploy!

### Frontend Deployment (Vercel/Netlify)

1. Build the project: `npm run build`
2. Deploy `dist/` folder
3. Set environment variable: `VITE_API_URL`
4. Configure redirects for SPA routing

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

---

## 📄 License

MIT License - feel free to use this project for learning or building your own student community platform!

---

## 🎉 Credits

Built with ❤️ for students who love to share and laugh together.

**Tech Stack Credits:**
- React Team for React
- Vercel for Next.js inspiration
- TailwindCSS for utility-first CSS
- MongoDB for flexible database
- Cloudinary for media management

---

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues for solutions

**Happy Coding! 🚀**
