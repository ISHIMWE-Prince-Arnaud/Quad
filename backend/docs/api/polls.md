# Polls API Documentation

Interactive polls with voting, media support, and automatic expiration.

## 📊 Endpoints

### Create Poll
**POST** `/api/polls`

Create a new poll with 2-5 options.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "question": "What's your favorite programming language?",
  "questionMedia": {
    "url": "https://cloudinary.com/image.jpg",
    "type": "image"
  },
  "options": [
    {
      "text": "JavaScript",
      "media": {
        "url": "https://cloudinary.com/js-logo.png",
        "type": "image"
      }
    },
    {
      "text": "Python"
    },
    {
      "text": "TypeScript"
    }
  ],
  "settings": {
    "allowMultiple": false,
    "showResults": "after_vote"
  },
  "expiresAt": "2023-12-15T23:59:59Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "author": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "username": "johndoe",
      "displayName": "John Doe",
      "profileImage": "https://avatar.iran.liara.run/public/42"
    },
    "question": "What's your favorite programming language?",
    "questionMedia": {...},
    "options": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "text": "JavaScript",
        "media": {...},
        "votesCount": 0
      }
    ],
    "settings": {
      "allowMultiple": false,
      "showResults": "after_vote"
    },
    "status": "active",
    "expiresAt": "2023-12-15T23:59:59Z",
    "totalVotes": 0,
    "reactionsCount": 0,
    "commentsCount": 0,
    "createdAt": "2023-12-01T10:30:00Z"
  }
}
```

### Get All Polls
**GET** `/api/polls`

Retrieve paginated list of polls.

**Query Parameters:**
- `limit` (optional): Number of polls (default: 20, max: 50)
- `offset` (optional): Number to skip (default: 0)
- `status` (optional): `active` | `expired` | `closed` | `all` (default: all)
- `sortBy` (optional): `newest` | `oldest` | `popular` | `ending_soon` (default: newest)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "polls": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "author": {...},
        "question": "What's your favorite programming language?",
        "options": [...],
        "settings": {...},
        "status": "active",
        "totalVotes": 25,
        "reactionsCount": 5,
        "commentsCount": 3,
        "expiresAt": "2023-12-15T23:59:59Z",
        "createdAt": "2023-12-01T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### Get User's Polls
**GET** `/api/polls/my-polls`

Get polls created by the authenticated user.

**Query Parameters:**
- Same as get all polls

### Get Single Poll
**GET** `/api/polls/:pollId`

Get specific poll with full details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "author": {...},
    "question": "What's your favorite programming language?",
    "questionMedia": {...},
    "options": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "text": "JavaScript",
        "media": {...},
        "votesCount": 15,
        "percentage": 60.0
      },
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "text": "Python",
        "votesCount": 10,
        "percentage": 40.0
      }
    ],
    "settings": {...},
    "status": "active",
    "totalVotes": 25,
    "userVote": ["64f8a1b2c3d4e5f6a7b8c9d2"],
    "expiresAt": "2023-12-15T23:59:59Z",
    "timeRemaining": "13 days 14 hours",
    "createdAt": "2023-12-01T10:30:00Z"
  }
}
```

### Vote on Poll
**POST** `/api/polls/:pollId/vote`

Vote on a poll option.

**Request Body:**
```json
{
  "optionIds": ["64f8a1b2c3d4e5f6a7b8c9d2"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Vote recorded successfully",
  "data": {
    "poll": {...},
    "userVote": ["64f8a1b2c3d4e5f6a7b8c9d2"]
  }
}
```

### Remove Vote
**DELETE** `/api/polls/:pollId/vote`

Remove user's vote from poll.

**Response (200):**
```json
{
  "success": true,
  "message": "Vote removed successfully"
}
```

### Update Poll
**PUT** `/api/polls/:pollId`

Update poll details (author only, before voting starts).

**Request Body:**
```json
{
  "question": "Updated question",
  "expiresAt": "2023-12-20T23:59:59Z"
}
```

### Close Poll
**POST** `/api/polls/:pollId/close`

Manually close an active poll (author only).

**Response (200):**
```json
{
  "success": true,
  "message": "Poll closed successfully"
}
```

### Delete Poll
**DELETE** `/api/polls/:pollId`

Delete a poll (author only).

## 📋 Validation Rules

### Poll Creation
- **question**: Required, 10-280 characters
- **options**: Required array, 2-5 items
  - **text**: Required per option, 1-100 characters
  - **media**: Optional media object
- **settings.allowMultiple**: Boolean (default: false)
- **settings.showResults**: `always` | `after_vote` | `after_close` (default: after_vote)
- **expiresAt**: Optional future date (max 30 days)

### Voting
- **optionIds**: Required array of valid option IDs
- Must respect `allowMultiple` setting
- Cannot vote on expired/closed polls
- Cannot vote multiple times (unless removing vote first)

## 🔧 Poll Features

### Media Support
- **Question Media**: Images/videos for the poll question
- **Option Media**: Visual options with images
- **Multiple Formats**: Supports various media types

### Voting Options
- **Single Choice**: Traditional poll behavior
- **Multiple Choice**: Allow selecting multiple options
- **Vote Changes**: Remove and re-vote capability

### Results Visibility
- **Always**: Results visible without voting
- **After Vote**: See results after voting
- **After Close**: Results only when poll ends

### Automatic Expiration
- **Cron Job**: Automatically closes expired polls
- **Status Updates**: Changes status from active to expired
- **Notifications**: Notifies author when poll expires

### Real-time Updates
- **Live Voting**: Socket.IO updates for real-time results
- **Vote Counts**: Instant vote count updates
- **Status Changes**: Real-time status updates

## ❌ Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Poll must have 2-5 options"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Cannot vote on expired poll"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Poll not found"
}
```

### 409 - Conflict
```json
{
  "success": false,
  "message": "You have already voted on this poll"
}
```

## 💡 Usage Examples

### Create simple poll
```bash
curl -X POST "http://localhost:4000/api/polls" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Pizza or Burger?",
    "options": [
      {"text": "Pizza 🍕"},
      {"text": "Burger 🍔"}
    ]
  }'
```

### Vote on poll
```bash
curl -X POST "http://localhost:4000/api/polls/64f8a1b2c3d4e5f6a7b8c9d0/vote" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "optionIds": ["64f8a1b2c3d4e5f6a7b8c9d2"]
  }'
```

### Get active polls
```bash
curl -X GET "http://localhost:4000/api/polls?status=active&limit=10" \
  -H "Authorization: Bearer <jwt_token>"
```
