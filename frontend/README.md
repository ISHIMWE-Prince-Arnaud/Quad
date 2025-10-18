# Quad Frontend

Frontend client for Quad - Student Social Platform. Built with React, TypeScript, Vite, Tailwind CSS, and Socket.IO.

## 🚀 Features

- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** for modern styling
- **Socket.IO** for real-time updates
- **Dark/Light mode** toggle
- **Fully responsive** design
- **React Router** for navigation
- **Context API** for state management

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── common/      # Button, Input, Modal, etc.
│   │   ├── layout/      # Sidebar, MainLayout
│   │   ├── feed/        # Post-related components
│   │   ├── polls/       # Poll-related components
│   │   ├── chat/        # Chat components
│   │   ├── confessions/ # Confession components
│   │   └── profile/     # Profile components
│   ├── context/         # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── SocketContext.tsx
│   │   └── ThemeContext.tsx
│   ├── pages/           # Page components
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── FeedPage.tsx
│   │   ├── PollsPage.tsx
│   │   ├── ChatPage.tsx
│   │   ├── ConfessionsPage.tsx
│   │   └── ProfilePage.tsx
│   ├── services/        # API service layer
│   │   └── api.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   └── formatTimeAgo.ts
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── .env                 # Environment variables (create from .env.example)
```

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   
   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

   Required environment variable:
   - `VITE_API_URL` - Backend API URL (default: http://localhost:5000)

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

4. **Build for production:**
   ```bash
   npm run build
   ```

   Preview production build:
   ```bash
   npm run preview
   ```

## 📱 Pages & Features

### Authentication
- **Login Page** - User login with username/password
- **Register Page** - New user registration

### Main Features
- **Feed** - View and interact with posts (like, comment)
- **Polls** - Create and vote on polls and "Would You Rather" questions
- **Chat** - Global chat room with real-time messaging
- **Confessions** - Anonymous posts with generated identities
- **Profile** - User profiles with posts, polls, and comments tabs

### UI Components

#### Layout
- **Sidebar** - Collapsible navigation (drawer on mobile)
- **MainLayout** - Two-column layout wrapper
- **Floating Action Button** - Quick create menu

#### Common Components
- **Button** - Reusable button component
- **Input** - Text input component
- **Modal** - Modal dialog component
- **Textarea** - Multiline text input

#### Feature Components
- **PostCard** - Post display with media, likes, comments
- **PollCard** - Poll with voting and results
- **ChatMessage** - Chat message bubble
- **ConfessionCard** - Anonymous confession with distinct styling
- **ProfileHeader** - User profile header with avatar upload

## 🎨 Styling

The app uses **Tailwind CSS** with a custom configuration:

- **Primary Color:** Blue (#3b82f6)
- **Default Theme:** Dark mode
- **Color Palette:** Blue, white, and black
- **Dark Mode:** Fully supported with toggle

### Responsive Breakpoints
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px (lg)

## 🔌 Real-time Features

The app connects to the backend via Socket.IO for real-time updates:

### Socket Events Listened
- `new_post` - New post added to feed
- `update_post_likes` - Post likes updated
- `new_comment` - New comment added
- `new_poll` - New poll created
- `update_poll_votes` - Poll votes updated
- `new_confession` - New confession posted
- `update_confession_likes` - Confession likes updated
- `new_thought` - New thought added
- `new_chat_message` - New chat message

### Socket Events Emitted
- `send_chat_message` - Send chat message

## 🔐 Authentication

The app uses JWT tokens for authentication:

1. User logs in or registers
2. Token is stored in localStorage
3. Token is included in API requests via Axios interceptor
4. Token is used for Socket.IO authentication

**Protected Routes:**
- All main pages (Feed, Polls, Chat, Confessions, Profile)
- Automatically redirect to login if not authenticated

## 📦 Dependencies

### Core
- `react` & `react-dom` - UI library
- `react-router-dom` - Routing
- `axios` - HTTP client
- `socket.io-client` - Real-time communication

### UI & Styling
- `tailwindcss` - Utility-first CSS
- `lucide-react` - Icon library
- `date-fns` - Date formatting

### Development
- `vite` - Build tool
- `typescript` - Type safety
- `@vitejs/plugin-react` - React plugin for Vite

## 🔧 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🌐 API Integration

All API calls are centralized in `src/services/api.ts`:

- **Authentication**: Login, register, get current user
- **Posts**: Get posts, create, like, comment
- **Polls**: Get polls, create, vote
- **Confessions**: Get, create, like, add thoughts
- **Chat**: Get messages, send messages
- **Users**: Get profile, update profile picture

The API service automatically includes JWT token in requests and handles errors.

## 🎯 Context Providers

### AuthContext
- Manages user authentication state
- Provides login, register, logout functions
- Persists token in localStorage

### SocketContext
- Manages Socket.IO connection
- Authenticates with JWT token
- Provides socket instance to components

### ThemeContext
- Manages dark/light mode
- Persists theme preference
- Provides toggle function

## 📝 Usage Examples

### Using Auth Context
```typescript
import { useAuth } from '../context/AuthContext';

const { user, login, logout } = useAuth();
```

### Using Socket Context
```typescript
import { useSocket } from '../context/SocketContext';

const { socket, connected } = useSocket();

useEffect(() => {
  socket?.on('new_post', handleNewPost);
}, [socket]);
```

### Using Theme Context
```typescript
import { useTheme } from '../context/ThemeContext';

const { theme, toggleTheme } = useTheme();
```

## 🐛 Troubleshooting

**Cannot connect to backend:**
```bash
# Check VITE_API_URL in .env
# Ensure backend server is running
# Verify CORS settings on backend
```

**Socket.IO not connecting:**
```bash
# Check if user is authenticated
# Verify backend Socket.IO server is running
# Check browser console for errors
```

**Build errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🔒 Security

- JWT tokens stored in localStorage
- Automatic token refresh on app load
- Protected routes redirect to login
- CORS protection via backend
- Input validation on forms

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to customize the color palette:
```javascript
theme: {
  extend: {
    colors: {
      primary: { /* your colors */ }
    }
  }
}
```

### Theme
Default theme is set to dark in `ThemeContext.tsx`:
```typescript
const [theme, setTheme] = useState<'light' | 'dark'>('dark');
```

## 📄 License

MIT License
