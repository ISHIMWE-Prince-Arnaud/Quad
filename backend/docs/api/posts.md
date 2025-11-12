# Posts API Documentation

Manage text posts with media attachments.

## 📝 Endpoints

### Create Post
**POST** `/api/posts`

Create a new post with optional media.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "Post content (required, 1-500 chars)",
  "media": [
    {
      "url": "https://cloudinary.com/image.jpg",
      "type": "image",
      "width": 1080,
      "height": 1080
    }
  ]
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
    "text": "Post content",
    "media": [...],
    "reactionsCount": 0,
    "commentsCount": 0,
    "createdAt": "2023-12-01T10:30:00Z",
    "updatedAt": "2023-12-01T10:30:00Z"
  }
}
```

### Get All Posts
**GET** `/api/posts`

Retrieve paginated list of posts.

**Query Parameters:**
- `limit` (optional): Number of posts to return (default: 20, max: 50)
- `offset` (optional): Number of posts to skip (default: 0)
- `sortBy` (optional): Sort order - `newest` | `oldest` | `popular` (default: newest)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "author": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "username": "johndoe",
          "displayName": "John Doe",
          "profileImage": "https://avatar.iran.liara.run/public/42"
        },
        "text": "Post content",
        "media": [...],
        "reactionsCount": 15,
        "commentsCount": 3,
        "createdAt": "2023-12-01T10:30:00Z",
        "updatedAt": "2023-12-01T10:30:00Z"
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

### Get Single Post
**GET** `/api/posts/:postId`

Retrieve a specific post by ID.

**Parameters:**
- `postId`: MongoDB ObjectId of the post

**Response (200):**
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
    "text": "Post content",
    "media": [...],
    "reactionsCount": 15,
    "commentsCount": 3,
    "createdAt": "2023-12-01T10:30:00Z",
    "updatedAt": "2023-12-01T10:30:00Z"
  }
}
```

### Update Post
**PUT** `/api/posts/:postId`

Update an existing post (author only).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "Updated post content",
  "media": [
    {
      "url": "https://cloudinary.com/new-image.jpg",
      "type": "image",
      "width": 1080,
      "height": 1080
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "text": "Updated post content",
    "media": [...],
    "updatedAt": "2023-12-01T11:30:00Z"
  }
}
```

### Delete Post
**DELETE** `/api/posts/:postId`

Delete a post (author only).

**Parameters:**
- `postId`: MongoDB ObjectId of the post

**Response (200):**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

## 📋 Validation Rules

### Post Creation/Update
- **text**: Required, string, 1-500 characters
- **media**: Optional array of media objects
  - **url**: Required if media provided, valid URL
  - **type**: Required, enum: `image` | `video`
  - **width**: Optional number
  - **height**: Optional number

## ❌ Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "error": "Text is required and must be between 1-500 characters"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "You can only edit your own posts"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Post not found"
}
```

## 🔗 Related Endpoints

- **Comments**: `/api/comments?contentType=post&contentId=<postId>`
- **Reactions**: `/api/reactions?contentType=post&contentId=<postId>`
- **User Posts**: `/api/profile/:username/posts`

## 💡 Usage Examples

### Create a text-only post
```bash
curl -X POST "http://localhost:4000/api/posts" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Just launched my new project! 🚀"
  }'
```

### Create a post with image
```bash
curl -X POST "http://localhost:4000/api/posts" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Beautiful sunset today",
    "media": [{
      "url": "https://res.cloudinary.com/demo/image/upload/v1/sunset.jpg",
      "type": "image",
      "width": 1080,
      "height": 720
    }]
  }'
```

### Get recent posts
```bash
curl -X GET "http://localhost:4000/api/posts?limit=10&sortBy=newest" \
  -H "Authorization: Bearer <jwt_token>"
```
