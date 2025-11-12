# 🔐 **Authentication Documentation**

## 📋 **Overview**

Quad uses Clerk for authentication, providing secure user management with social logins, email verification, and session management. This document covers the complete authentication implementation.

---

## 🏗️ **Authentication Architecture**

### **Authentication Flow**
```
Frontend → Clerk Widget → Clerk API → Backend Middleware → Protected Routes
```

### **Components**
- **Clerk Dashboard**: User management and configuration
- **Clerk Frontend SDK**: Login/signup widgets
- **Clerk Backend SDK**: Token verification and user data
- **Auth Middleware**: Route protection and user context

---

## ⚙️ **Configuration**

### **Environment Variables**
```bash
# Clerk Configuration
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxx

# Frontend Integration
CLERK_FRONTEND_API=your-clerk-frontend-api
```

### **Clerk Setup** (`config/clerk.config.ts`)
```typescript
import { ClerkSDKError } from '@clerk/express';

export const clerkConfig = {
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
  secretKey: process.env.CLERK_SECRET_KEY!,
  webhookSecret: process.env.CLERK_WEBHOOK_SECRET!,
  apiVersion: 'v1',
  // Additional configuration options
};
```

---

## 🛡️ **Middleware Implementation**

### **Auth Middleware** (`middlewares/auth.middleware.ts`)
```typescript
import { clerkMiddleware, requireAuth } from '@clerk/express';

// Apply Clerk middleware to all routes
app.use(clerkMiddleware());

// Protect specific routes
export const requireAuthentication = requireAuth({
  onError: (error) => {
    return Response.json(
      { success: false, message: 'Authentication required' },
      { status: 401 }
    );
  }
});
```

### **User Context Extraction**
```typescript
export const extractUser = (req: Request) => {
  const { userId, sessionId } = req.auth;
  return {
    userId,
    sessionId,
    isAuthenticated: !!userId
  };
};
```

---

## 👤 **User Management**

### **User Creation Webhook**
When a user signs up through Clerk, a webhook creates the user in our database:

```typescript
// routes/webhook.routes.ts
app.post('/api/webhooks/clerk', (req, res) => {
  const { type, data } = req.body;
  
  switch (type) {
    case 'user.created':
      await createUserFromClerk(data);
      break;
    case 'user.updated':
      await updateUserFromClerk(data);
      break;
    case 'user.deleted':
      await deleteUserFromClerk(data);
      break;
  }
});
```

### **User Synchronization**
```typescript
// controllers/user.controller.ts
export const createUser = async (req: Request, res: Response) => {
  const { userId } = req.auth;
  
  // Get user data from Clerk
  const clerkUser = await clerkClient.users.getUser(userId);
  
  // Create user in our database
  const newUser = await User.create({
    clerkId: userId,
    username: clerkUser.username,
    email: clerkUser.emailAddresses[0]?.emailAddress,
    profileImage: clerkUser.profileImageUrl,
  });
  
  return res.json({ success: true, data: newUser });
};
```

---

## 🔒 **Route Protection**

### **Protected Route Examples**
```typescript
// Require authentication for all routes
app.use('/api/posts', requireAuth());

// Optional authentication (user context available if logged in)
app.use('/api/public', clerkMiddleware());

// Custom auth check
app.get('/api/admin', requireAuth(), isAdmin, handler);
```

### **Permission Levels**
```typescript
export const requireOwnership = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.auth;
  const { id } = req.params;
  
  const resource = await findResourceById(id);
  
  if (resource.userId !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Resource ownership required'
    });
  }
  
  next();
};
```

---

## 📱 **Frontend Integration**

### **React Integration Example**
```jsx
import { ClerkProvider, SignInButton, SignOutButton, useUser } from '@clerk/clerk-react';

function App() {
  const { isSignedIn, user } = useUser();
  
  return (
    <ClerkProvider publishableKey={process.env.REACT_APP_CLERK_PUBLISHABLE_KEY}>
      {isSignedIn ? (
        <div>
          <h1>Welcome, {user.firstName}!</h1>
          <SignOutButton />
        </div>
      ) : (
        <SignInButton />
      )}
    </ClerkProvider>
  );
}
```

### **API Request with Auth**
```javascript
// Frontend API call with authentication
const response = await fetch('/api/posts', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${await getToken()}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 🔧 **User Profile Management**

### **Profile Data Structure**
```typescript
interface UserProfile {
  clerkId: string;       // Primary identifier from Clerk
  username: string;      // Unique username
  email: string;         // Email address
  displayName?: string;  // Display name
  bio?: string;          // User biography
  profileImage?: string; // Profile image URL
  isVerified: boolean;   // Verification status
  settings: {
    privacy: 'public' | 'private';
    notifications: boolean;
    emailUpdates: boolean;
  };
}
```

### **Profile Updates**
```typescript
export const updateProfile = async (req: Request, res: Response) => {
  const { userId } = req.auth;
  const updates = req.body;
  
  // Update in our database
  const user = await User.findOneAndUpdate(
    { clerkId: userId },
    updates,
    { new: true }
  );
  
  // Optionally sync with Clerk
  await clerkClient.users.updateUser(userId, {
    firstName: updates.firstName,
    lastName: updates.lastName,
  });
  
  return res.json({ success: true, data: user });
};
```

---

## 🔐 **Session Management**

### **Session Validation**
```typescript
export const validateSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.auth;
    
    // Verify session is still active
    const session = await clerkClient.sessions.getSession(sessionId);
    
    if (session.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Session expired'
      });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid session'
    });
  }
};
```

### **Session Refresh**
```typescript
// Frontend session refresh
const refreshSession = async () => {
  try {
    await clerk.session?.reload();
  } catch (error) {
    // Redirect to login
    window.location.href = '/login';
  }
};
```

---

## 🔔 **Webhooks**

### **Webhook Security**
```typescript
import { Webhook } from 'svix';

export const verifyWebhook = (req: Request, res: Response, next: NextFunction) => {
  const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  
  try {
    const payload = webhook.verify(
      JSON.stringify(req.body),
      req.headers as Record<string, string>
    );
    
    req.body = payload;
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid webhook signature'
    });
  }
};
```

### **Webhook Events**
```typescript
// Supported Clerk webhook events
const WEBHOOK_EVENTS = {
  'user.created': handleUserCreated,
  'user.updated': handleUserUpdated,
  'user.deleted': handleUserDeleted,
  'session.created': handleSessionCreated,
  'session.ended': handleSessionEnded,
};

export const handleWebhook = async (req: Request, res: Response) => {
  const { type, data } = req.body;
  
  const handler = WEBHOOK_EVENTS[type];
  if (handler) {
    await handler(data);
  }
  
  return res.status(200).json({ success: true });
};
```

---

## 🛡️ **Security Features**

### **Multi-Factor Authentication (MFA)**
```typescript
// Enable MFA for user
export const enableMFA = async (req: Request, res: Response) => {
  const { userId } = req.auth;
  
  try {
    await clerkClient.users.updateUser(userId, {
      publicMetadata: { mfaEnabled: true }
    });
    
    return res.json({
      success: true,
      message: 'MFA enabled successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to enable MFA'
    });
  }
};
```

### **Rate Limiting by User**
```typescript
// User-specific rate limiting
export const userRateLimit = rateLimit({
  keyGenerator: (req) => req.auth.userId,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each user to 100 requests per windowMs
});
```

---

## 🔍 **User Search & Discovery**

### **User Search**
```typescript
export const searchUsers = async (req: Request, res: Response) => {
  const { query } = req.query;
  const { userId } = req.auth; // Current user for personalization
  
  const users = await User.find({
    $and: [
      { clerkId: { $ne: userId } }, // Exclude self
      {
        $or: [
          { username: new RegExp(query, 'i') },
          { displayName: new RegExp(query, 'i') }
        ]
      }
    ]
  }).limit(20);
  
  return res.json({ success: true, data: users });
};
```

---

## 📊 **Authentication Analytics**

### **User Activity Tracking**
```typescript
export const trackUserActivity = async (userId: string, action: string) => {
  await UserActivity.create({
    userId,
    action,
    timestamp: new Date(),
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
};
```

### **Login Analytics**
```typescript
// Track login events
export const handleLogin = async (req: Request, res: Response) => {
  const { userId } = req.auth;
  
  await User.findOneAndUpdate(
    { clerkId: userId },
    { 
      lastLoginAt: new Date(),
      $inc: { loginCount: 1 }
    }
  );
  
  await trackUserActivity(userId, 'login');
};
```

---

## 🔧 **Development & Testing**

### **Mock Authentication (Testing)**
```typescript
// Test helper for mocking auth
export const mockAuth = (userId: string) => ({
  auth: { userId, sessionId: 'test-session' }
});

// Usage in tests
const req = { ...mockAuth('user_123'), body: testData };
```

### **Auth State Debugging**
```typescript
export const debugAuth = (req: Request, res: Response) => {
  const { userId, sessionId } = req.auth;
  
  return res.json({
    isAuthenticated: !!userId,
    userId,
    sessionId,
    headers: req.headers.authorization,
    timestamp: new Date().toISOString()
  });
};
```

---

## 🚨 **Error Handling**

### **Common Auth Errors**
```typescript
export const authErrorHandler = (error: any, req: Request, res: Response) => {
  switch (error.code) {
    case 'unauthenticated':
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    
    case 'session_expired':
      return res.status(401).json({
        success: false,
        message: 'Session expired',
        code: 'SESSION_EXPIRED'
      });
    
    case 'insufficient_permissions':
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'FORBIDDEN'
      });
    
    default:
      return res.status(500).json({
        success: false,
        message: 'Authentication error',
        code: 'AUTH_ERROR'
      });
  }
};
```

---

## 📝 **Best Practices**

### **Security Guidelines**
1. **Always validate tokens** on the backend
2. **Use HTTPS** in production
3. **Implement proper CORS** policies
4. **Store sensitive data** in environment variables
5. **Regular security audits** of auth implementation

### **Performance Tips**
1. **Cache user data** to reduce Clerk API calls
2. **Use database indexes** on clerkId fields
3. **Implement token refresh** logic
4. **Monitor auth endpoint** performance

### **User Experience**
1. **Smooth login/logout** flows
2. **Clear error messages** for auth failures
3. **Progressive enhancement** for JS-disabled users
4. **Mobile-friendly** auth widgets

---

This authentication system provides enterprise-grade security with seamless user experience, leveraging Clerk's robust authentication infrastructure while maintaining full control over user data and permissions.
