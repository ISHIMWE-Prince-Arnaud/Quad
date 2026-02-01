# Deployment Guide

This guide covers deploying the Quad platform to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Build Process](#build-process)
4. [Deployment Options](#deployment-options)
5. [Post-Deployment](#post-deployment)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Accounts

- [ ] MongoDB Atlas account (or MongoDB hosting)
- [ ] Clerk account for authentication
- [ ] Cloudinary account for media storage
- [ ] Domain name and DNS access
- [ ] Hosting provider account (Vercel, Railway, AWS, etc.)
- [ ] (Optional) Sentry account for error tracking

### Required Tools

- Node.js 18+ and npm
- Git

## Environment Setup

### 1. Configure Environment Variables

#### Frontend (.env.production)

```bash
# Backend API Configuration
VITE_API_BASE_URL=https://api.yourproductiondomain.com/api
VITE_SOCKET_URL=https://api.yourproductiondomain.com

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key

# Feature Flags
VITE_ENABLE_NOTIFICATIONS=true

# Error Tracking
VITE_SENTRY_DSN=your_sentry_dsn
VITE_SENTRY_ENVIRONMENT=production
```

#### Backend (.env.production)

```bash
# Server Configuration
PORT=4000
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/quad

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
CLERK_SECRET_KEY=sk_live_your_production_secret
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
FRONTEND_URL=https://yourproductiondomain.com

# Error Tracking
SENTRY_DSN=your_sentry_dsn
SENTRY_ENVIRONMENT=production
```

See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for detailed documentation.

### 2. Set Up External Services

#### MongoDB Atlas

1. Create a cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user with read/write permissions
3. Whitelist your application's IP addresses (or use 0.0.0.0/0 for all IPs)
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Update `MONGODB_URI` in backend `.env.production`

#### Clerk Authentication

1. Go to [clerk.com](https://clerk.com) dashboard
2. Create a production application
3. Copy publishable key and secret key
4. Configure redirect URLs:
   - Sign-in URL: `https://yourproductiondomain.com/login`
   - Sign-up URL: `https://yourproductiondomain.com/signup`
   - After sign-in: `https://yourproductiondomain.com/app/feed`
5. Set up webhook endpoint: `https://api.yourproductiondomain.com/api/webhooks/clerk`
6. Copy webhook signing secret

#### Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com) dashboard
2. Copy cloud name, API key, and API secret
3. (Optional) Configure upload presets for unsigned uploads
4. (Optional) Set up transformations for image optimization

## Build Process

### Frontend Build

```bash
cd frontend

# Install dependencies
npm install

# Type check
npm run typecheck

# Run tests
npm test

# Build for production
npm run build:production

# Preview production build locally
npm run preview:production
```

Build output will be in `frontend/dist/`

### Backend Build

```bash
cd backend

# Install dependencies
npm install

# Type check
npm run typecheck

# Build TypeScript
npm run build:production
```

Build output will be in `backend/dist/`

## Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Deploy Frontend to Vercel

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Deploy**

   ```bash
   cd frontend
   vercel --prod
   ```

3. **Configure Environment Variables**
   - Go to Vercel dashboard → Project Settings → Environment Variables
   - Add all variables from `.env.production`
   - Redeploy if needed

4. **Configure Domain**
   - Add custom domain in Vercel dashboard
   - Update DNS records as instructed

#### Deploy Backend to Railway

1. **Install Railway CLI**

   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Initialize**

   ```bash
   railway login
   cd backend
   railway init
   ```

3. **Configure Environment Variables**

   ```bash
   railway variables set NODE_ENV=production
   railway variables set PORT=4000
   # Add all other variables from .env.production
   ```

4. **Deploy**

   ```bash
   railway up
   ```

5. **Get Deployment URL**
   ```bash
   railway domain
   ```
   Update `VITE_API_BASE_URL` in frontend with this URL.

### Option 2: AWS (EC2 + S3 + CloudFront)

#### Deploy Frontend to S3 + CloudFront

1. **Build Frontend**

   ```bash
   cd frontend
   npm run build:production
   ```

2. **Create S3 Bucket**

   ```bash
   aws s3 mb s3://your-bucket-name
   aws s3 website s3://your-bucket-name --index-document index.html
   ```

3. **Upload Build**

   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

4. **Create CloudFront Distribution**
   - Origin: S3 bucket
   - Default root object: `index.html`
   - Error pages: Redirect 404 to `/index.html` (for SPA routing)

5. **Configure Custom Domain**
   - Add CNAME record pointing to CloudFront distribution
   - Add SSL certificate via AWS Certificate Manager

#### Deploy Backend to EC2

1. **Launch EC2 Instance**
   - AMI: Ubuntu 22.04 LTS
   - Instance type: t3.small or larger
   - Security group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 4000 (API)

2. **Connect and Setup**

   ```bash
   ssh ubuntu@your-ec2-ip

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Clone repository
   git clone https://github.com/yourusername/quad.git
   cd quad/backend

   # Install dependencies
   npm install

   # Build
   npm run build:production
   ```

3. **Configure Environment**

   ```bash
   nano .env.production
   # Add all environment variables
   ```

4. **Start with PM2**

   ```bash
   pm2 start dist/server.js --name quad-api
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx Reverse Proxy**

   ```bash
   sudo apt-get install nginx
   sudo nano /etc/nginx/sites-available/quad
   ```

   ```nginx
   server {
       listen 80;
       server_name api.yourproductiondomain.com;

       location / {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/quad /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Configure SSL with Let's Encrypt**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourproductiondomain.com
   ```

### Option 3: Docker Deployment

#### Create Dockerfiles

**Frontend Dockerfile**

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:production

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Backend Dockerfile**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build:production
EXPOSE 4000
CMD ["node", "dist/server.js"]
```

**docker-compose.yml**

```yaml
version: "3.8"

services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=http://api:4000/api
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - PORT=4000
      - MONGODB_URI=${MONGODB_URI}
      - CLERK_PUBLISHABLE_KEY=${CLERK_PUBLISHABLE_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
      - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
      - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
    depends_on:
      - mongodb

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

**Deploy**

```bash
docker-compose up -d
```

## Post-Deployment

### 1. Verify Deployment

#### Health Checks

```bash
# Basic health check
curl https://api.yourproductiondomain.com/health

# Detailed health check
curl https://api.yourproductiondomain.com/health/detailed

# Frontend
curl https://yourproductiondomain.com
```

#### Test Key Features

- [ ] User registration and login
- [ ] Create post
- [ ] Upload image
- [ ] Real-time chat
- [ ] Notifications

### 2. Configure DNS

Point your domain to your deployment:

```
A     @                  your-server-ip
A     api                your-api-server-ip
CNAME www                yourproductiondomain.com
```

### 3. Set Up SSL Certificates

Use Let's Encrypt for free SSL:

```bash
sudo certbot --nginx -d yourproductiondomain.com -d www.yourproductiondomain.com
```

### 4. Configure CDN

See [CDN_CONFIGURATION.md](./CDN_CONFIGURATION.md) for detailed instructions.

### 5. Set Up Monitoring

#### Error Tracking (Sentry)

Errors are automatically sent to Sentry if `SENTRY_DSN` is configured.

#### Server Monitoring

Use PM2 monitoring:

```bash
pm2 monit
```

Or set up external monitoring:

- UptimeRobot for uptime monitoring
- New Relic for APM
- Datadog for infrastructure monitoring

### 6. Set Up Backups

#### MongoDB Backups

**Automated (MongoDB Atlas)**

- Enable automatic backups in Atlas dashboard
- Configure retention period
- Test restore process

**Manual**

```bash
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/quad" --out=/backup/$(date +%Y%m%d)
```

#### Media Backups

Cloudinary automatically stores media. Configure backup policies in Cloudinary dashboard.

## Monitoring

### Application Metrics

Monitor these key metrics:

- **Response Time**: < 200ms for API calls
- **Error Rate**: < 1%
- **Uptime**: > 99.9%
- **Database Connections**: Monitor connection pool
- **Memory Usage**: < 80% of available
- **CPU Usage**: < 70% average

### Logs

#### View Logs

**PM2**

```bash
pm2 logs quad-api
```

**Docker**

```bash
docker-compose logs -f backend
```

**Railway**

```bash
railway logs
```

#### Log Aggregation

Consider using:

- Papertrail
- Loggly
- AWS CloudWatch Logs

## Troubleshooting

### Common Issues

#### 1. CORS Errors

**Symptom**: Browser console shows CORS errors

**Solution**:

- Verify `FRONTEND_URL` is set correctly in backend
- Check CORS configuration in `backend/src/config/cors.config.ts`
- Ensure frontend URL matches exactly (no trailing slash)

#### 2. Database Connection Fails

**Symptom**: "MongoNetworkError" or connection timeout

**Solution**:

- Verify `MONGODB_URI` is correct
- Check IP whitelist in MongoDB Atlas
- Test connection: `mongosh "mongodb+srv://..."`
- Check firewall rules

#### 3. Clerk Authentication Not Working

**Symptom**: Users can't log in

**Solution**:

- Verify Clerk keys are correct
- Check redirect URLs in Clerk dashboard
- Ensure `CLERK_PUBLISHABLE_KEY` matches environment
- Check browser console for Clerk errors

#### 4. Images Not Uploading

**Symptom**: Upload fails or images don't display

**Solution**:

- Verify Cloudinary credentials
- Check Cloudinary dashboard for errors
- Verify file size limits
- Check CORS settings in Cloudinary

#### 5. Real-time Features Not Working

**Symptom**: Chat messages don't appear, notifications delayed

**Solution**:

- Verify Socket.IO connection in browser console
- Check WebSocket support on hosting provider
- Verify CORS settings for Socket.IO
- Check firewall allows WebSocket connections

### Debug Mode

Enable debug logging:

**Backend**

```bash
DEBUG=* npm start
```

**Frontend**

```javascript
localStorage.setItem("debug", "*");
```

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] External services set up (MongoDB, Clerk, Cloudinary)
- [ ] SSL certificates ready
- [ ] Domain DNS configured
- [ ] Backup strategy in place

### Deployment

- [ ] Build frontend successfully
- [ ] Build backend successfully
- [ ] Deploy frontend
- [ ] Deploy backend
- [ ] Configure environment variables
- [ ] Set up SSL/HTTPS
- [ ] Configure CDN (optional)

### Post-Deployment

- [ ] Health checks passing
- [ ] Test user registration
- [ ] Test user login
- [ ] Test content creation
- [ ] Test real-time features
- [ ] Test file uploads
- [ ] Verify error tracking
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Document deployment

### Ongoing

- [ ] Monitor error rates
- [ ] Monitor performance
- [ ] Review logs regularly
- [ ] Update dependencies
- [ ] Rotate secrets periodically
- [ ] Test backup restoration
- [ ] Review security settings

## Rollback Procedure

If deployment fails:

### Vercel

```bash
vercel rollback
```

### Railway

```bash
railway rollback
```

### PM2

```bash
pm2 reload quad-api --update-env
```

### Docker

```bash
docker-compose down
docker-compose up -d --build
```

## Support

For deployment issues:

1. Check logs first
2. Review this documentation
3. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
4. Review error tracking (Sentry)
5. Contact hosting provider support

## Additional Resources

- [Environment Variables Documentation](./ENVIRONMENT_VARIABLES.md)
- [CDN Configuration Guide](./CDN_CONFIGURATION.md)
- [Backend API Documentation](../backend/docs/README.md)
- [Frontend Technical Documentation](./FRONTEND_TECHNICAL.md)
