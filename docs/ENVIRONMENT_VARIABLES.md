# Environment Variables Documentation

This document describes all environment variables used in the Quad platform.

## Frontend Environment Variables

All frontend environment variables must be prefixed with `VITE_` to be exposed to the client.

### Required Variables

| Variable                     | Description                              | Example                                    |
| ---------------------------- | ---------------------------------------- | ------------------------------------------ |
| `VITE_API_BASE_URL`          | Backend API base URL                     | `https://api.yourproductiondomain.com/api` |
| `VITE_SOCKET_URL`            | Socket.IO server URL                     | `https://api.yourproductiondomain.com`     |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key for authentication | `pk_live_...` or `pk_test_...`             |

### Optional Variables

| Variable                       | Description                     | Default       | Example                     |
| ------------------------------ | ------------------------------- | ------------- | --------------------------- |
| `VITE_CLERK_SIGN_IN_URL`       | Sign in page route              | `/login`      | `/login`                    |
| `VITE_CLERK_SIGN_UP_URL`       | Sign up page route              | `/signup`     | `/signup`                   |
| `VITE_CLERK_AFTER_SIGN_IN_URL` | Redirect after sign in          | `/app/feed`   | `/app/feed`                 |
| `VITE_CLERK_AFTER_SIGN_UP_URL` | Redirect after sign up          | `/app/feed`   | `/app/feed`                 |
| `VITE_ENABLE_ANALYTICS`        | Enable analytics tracking       | `false`       | `true`                      |
| `VITE_ENABLE_PWA`              | Enable PWA features             | `false`       | `true`                      |
| `VITE_ENABLE_NOTIFICATIONS`    | Enable push notifications       | `false`       | `true`                      |
| `VITE_NODE_ENV`                | Environment mode                | `development` | `production`                |
| `VITE_SENTRY_DSN`              | Sentry error tracking DSN       | -             | `https://...@sentry.io/...` |
| `VITE_SENTRY_ENVIRONMENT`      | Sentry environment name         | -             | `production`                |
| `VITE_GA_MEASUREMENT_ID`       | Google Analytics measurement ID | -             | `G-XXXXXXXXXX`              |

### Configuration Files

- **Development**: `.env` or `.env.development`
- **Production**: `.env.production`
- **Example**: `.env.example` (template with placeholder values)

## Backend Environment Variables

### Required Variables

| Variable                | Description                    | Example                                            |
| ----------------------- | ------------------------------ | -------------------------------------------------- |
| `NODE_ENV`              | Node environment               | `production` or `development`                      |
| `PORT`                  | Server port                    | `4000`                                             |
| `MONGODB_URI`           | MongoDB connection string      | `mongodb+srv://user:pass@cluster.mongodb.net/quad` |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key          | `pk_live_...`                                      |
| `CLERK_SECRET_KEY`      | Clerk secret key (server-side) | `sk_live_...`                                      |
| `CLERK_WEBHOOK_SECRET`  | Clerk webhook signing secret   | `whsec_...`                                        |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name          | `your-cloud-name`                                  |
| `CLOUDINARY_API_KEY`    | Cloudinary API key             | `123456789012345`                                  |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret          | `abcdefghijklmnopqrstuvwxyz`                       |

### Optional Variables

| Variable              | Description                             | Default | Example                            |
| --------------------- | --------------------------------------- | ------- | ---------------------------------- |
| `FRONTEND_URL`        | Frontend application URL (for CORS)     | `*`     | `https://yourproductiondomain.com` |
| `SENTRY_DSN`          | Sentry error tracking DSN               | -       | `https://...@sentry.io/...`        |
| `SENTRY_ENVIRONMENT`  | Sentry environment name                 | -       | `production`                       |
| `SKIP_INDEX_CREATION` | Skip database index creation on startup | `false` | `true`                             |

### Configuration Files

- **Development**: `.env`
- **Production**: `.env.production`
- **Example**: `.env.example` (template with placeholder values)

## Environment Setup Instructions

### Development Setup

1. **Frontend**:

   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env and fill in your development values
   ```

2. **Backend**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and fill in your development values
   ```

### Production Setup

1. **Frontend**:

   ```bash
   cd frontend
   cp .env.example .env.production
   # Edit .env.production with production values
   ```

2. **Backend**:
   ```bash
   cd backend
   cp .env.example .env.production
   # Edit .env.production with production values
   ```

## Getting API Keys

### Clerk Authentication

1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy the publishable key and secret key from the dashboard
4. For webhooks, create a webhook endpoint and copy the signing secret

### Cloudinary Media Storage

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Navigate to the dashboard
3. Copy your cloud name, API key, and API secret

### MongoDB Database

**Development**: Use local MongoDB or MongoDB Atlas free tier

**Production**: Use MongoDB Atlas or your preferred MongoDB hosting

1. Create a cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist your application's IP addresses
4. Copy the connection string

### Sentry Error Tracking (Optional)

1. Sign up at [sentry.io](https://sentry.io)
2. Create a new project
3. Copy the DSN from project settings

### Google Analytics (Optional)

1. Create a property at [analytics.google.com](https://analytics.google.com)
2. Copy the measurement ID (format: G-XXXXXXXXXX)

## Security Best Practices

1. **Never commit `.env` files** - They are in `.gitignore` by default
2. **Use different keys for development and production**
3. **Rotate secrets regularly** in production
4. **Use environment variables in CI/CD** - Don't hardcode secrets
5. **Restrict CORS origins** in production - Don't use `*`
6. **Use HTTPS** in production for all API calls
7. **Enable rate limiting** to prevent abuse
8. **Monitor error logs** for suspicious activity

## Validation

The application validates environment variables on startup:

- **Frontend**: Uses `src/lib/envValidation.ts` to validate required variables
- **Backend**: Uses Zod schema in `src/config/env.config.ts` to validate

If required variables are missing, the application will fail to start with a clear error message listing the missing variables.

## Troubleshooting

### "Missing required environment variables" error

- Check that all required variables are set in your `.env` file
- Ensure variable names are spelled correctly
- For frontend variables, ensure they start with `VITE_`
- Restart the development server after changing `.env` files

### CORS errors in production

- Set `FRONTEND_URL` in backend `.env.production`
- Ensure the URL matches your frontend domain exactly
- Include protocol (https://) and no trailing slash

### Clerk authentication not working

- Verify publishable key matches your Clerk application
- Check that secret key is correct (backend only)
- Ensure webhook secret matches your Clerk webhook configuration
- Verify redirect URLs are configured in Clerk dashboard

### Cloudinary uploads failing

- Verify all three Cloudinary credentials are correct
- Check that your Cloudinary account is active
- Ensure upload presets are configured if using unsigned uploads
