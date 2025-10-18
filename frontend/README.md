# Quad Frontend - Web Application

Modern, real-time social platform frontend built with React, TypeScript, Vite, and Socket.IO.

## Features

- **Modern UI** with Tailwind CSS
- **Dark/Light Mode** toggle
- **Real-time updates** with Socket.IO
- **Responsive design** for mobile, tablet, and desktop
- **JWT Authentication** with secure token storage
- **Image and video** uploads
- **Polls and voting** system
- **Anonymous confessions**
- **Global chat** with real-time messaging
- **User profiles** with activity tracking

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Socket.IO Client** for real-time communication
- **React Router** for navigation
- **Axios** for API requests
- **date-fns** for date formatting
- **Lucide React** for icons

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   ├── layout/          # Layout components (Sidebar, MainLayout)
│   │   ├── feed/            # Feed-related components
│   │   ├── polls/           # Poll-related components
│   │   ├── chat/            # Chat-related components
│   │   ├── confessions/     # Confession-related components
│   │   └── profile/         # Profile-related components
│   ├── context/             # React Context providers
│   ├── pages/               # Page components
│   ├── services/            # API service functions
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main App component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Backend server running (see `/backend` directory)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Features Overview

### Authentication
- Register with username, email, and password
- Login with username/email and password
- Persistent sessions with JWT tokens
- Automatic token refresh

### Feed
- View all posts in reverse chronological order
- Like and comment on posts
- Real-time updates for new posts, likes, and comments
- Image and video support
- Relative timestamps with hover for full date/time

### Polls
- Create regular polls or "Would You Rather" polls
- Vote on polls and see real-time results
- Progress bars showing vote percentages
- Optional media attachments
- Filter by poll type

### Chat
- Global chat room for all users
- Send text messages
- Real-time message delivery
- Message history on page load
- Auto-scroll to latest messages

### Confessions
- Post anonymously with generated identity
- Like and comment (as "thoughts") on confessions
- Unique visual design with purple gradient
- Anonymous avatar generation
- Media attachments supported

### Profile
- View user profile with avatar
- Upload/change profile picture
- Tabs for posts, polls, and comments
- Activity tracking
- Join date display

### Dark/Light Mode
- Toggle between dark and light themes
- Persistent theme preference
- Smooth transitions
- Tailwind CSS dark mode

## Real-time Features

The app uses Socket.IO for real-time updates:

- **New posts** appear instantly in the feed
- **Likes** update for all viewers
- **Comments** appear in real-time
- **Poll votes** update immediately
- **Confessions** and thoughts appear instantly
- **Chat messages** delivered in real-time

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
