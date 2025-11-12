# 🚀 **Deployment Documentation**

## 📋 **Overview**

This guide covers multiple deployment strategies for the Quad backend, from development to production environments. Choose the deployment method that best fits your needs and infrastructure requirements.

---

## 🎯 **Deployment Options Quick Reference**

| Method | Difficulty | Time | Best For | Cost |
|--------|------------|------|----------|------|
| **Railway** | ⭐ Easy | 5 min | MVP/Testing | $5-20/month |
| **Heroku** | ⭐⭐ Easy | 10 min | Small Scale | $7-25/month |
| **DigitalOcean App** | ⭐⭐ Medium | 15 min | Growing Apps | $12-50/month |
| **Docker + VPS** | ⭐⭐⭐ Medium | 30 min | Full Control | $5-40/month |
| **AWS/GCP** | ⭐⭐⭐⭐ Hard | 60 min | Enterprise | $20-200/month |

---

## 🚄 **Quick Deployment (Railway) - Recommended for Beginners**

### **Step 1: Prepare Your Project**
```bash
# Ensure your project builds successfully
npm run build

# Test locally first
npm run dev
```

### **Step 2: Deploy to Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

### **Step 3: Configure Environment Variables**
In Railway dashboard, add these environment variables:
```bash
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quad
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=your-secret
```

### **Step 4: Test Deployment**
```bash
# Check if your API is live
curl https://your-app.railway.app/

# Test protected endpoint
curl -H "Authorization: Bearer your-token" https://your-app.railway.app/api/users
```

---

## 🟦 **Heroku Deployment**

### **Step 1: Install Heroku CLI**
```bash
# Install Heroku CLI (varies by OS)
# Windows: Download from heroku.com
# macOS: brew tap heroku/brew && brew install heroku
# Ubuntu: sudo snap install --classic heroku
```

### **Step 2: Create Heroku App**
```bash
# Login
heroku login

# Create app
heroku create your-quad-backend

# Set buildpack for Node.js
heroku buildpacks:set heroku/nodejs
```

### **Step 3: Configure Environment Variables**
```bash
# Set all required environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/quad"
heroku config:set CLERK_SECRET_KEY="sk_live_..."
heroku config:set CLERK_WEBHOOK_SECRET="whsec_..."
heroku config:set CLOUDINARY_CLOUD_NAME="your-cloud-name"
heroku config:set CLOUDINARY_API_KEY="123456789"
heroku config:set CLOUDINARY_API_SECRET="your-secret"
```

### **Step 4: Create Procfile**
```bash
# Create Procfile in project root
echo "web: npm start" > Procfile
```

### **Step 5: Deploy**
```bash
# Add heroku remote
heroku git:remote -a your-quad-backend

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

---

## 🌊 **DigitalOcean App Platform**

### **Step 1: Create App Spec File**
Create `app.yaml` in your project root:
```yaml
name: quad-backend
services:
- name: api
  source_dir: /
  github:
    repo: your-username/quad-backend
    branch: main
  run_command: npm start
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 3001
  routes:
  - path: /
  envs:
  - key: NODE_ENV
    value: production
  - key: MONGODB_URI
    value: ${MONGODB_URI}
    type: SECRET
  - key: CLERK_SECRET_KEY
    value: ${CLERK_SECRET_KEY}
    type: SECRET
  - key: CLERK_WEBHOOK_SECRET
    value: ${CLERK_WEBHOOK_SECRET}
    type: SECRET
  - key: CLOUDINARY_CLOUD_NAME
    value: ${CLOUDINARY_CLOUD_NAME}
    type: SECRET
  - key: CLOUDINARY_API_KEY
    value: ${CLOUDINARY_API_KEY}
    type: SECRET
  - key: CLOUDINARY_API_SECRET
    value: ${CLOUDINARY_API_SECRET}
    type: SECRET
```

### **Step 2: Deploy via DigitalOcean Console**
1. Login to DigitalOcean
2. Go to Apps section
3. Create New App
4. Connect your GitHub repository
5. Upload the `app.yaml` file
6. Add environment secrets
7. Deploy

---

## 🐳 **Docker Deployment**

### **Step 1: Create Dockerfile**
```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start application
CMD ["node", "dist/server.js"]
```

### **Step 2: Create Docker Compose File**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  quad-backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl/certs:ro
    depends_on:
      - quad-backend
    restart: unless-stopped
```

### **Step 3: Create Nginx Configuration**
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server quad-backend:3001;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        # SSL Configuration
        ssl_certificate /etc/ssl/certs/fullchain.pem;
        ssl_certificate_key /etc/ssl/certs/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;

        # API routes
        location / {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 86400;
        }
    }
}
```

### **Step 4: Deploy with Docker**
```bash
# Build and start
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale if needed
docker-compose -f docker-compose.prod.yml up -d --scale quad-backend=3
```

---

## 🏭 **VPS Deployment (Traditional)**

### **Step 1: Server Setup (Ubuntu 20.04+)**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

### **Step 2: Deploy Application**
```bash
# Clone repository
git clone https://github.com/your-username/quad-backend.git
cd quad-backend

# Install dependencies
npm ci --production

# Build application
npm run build

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'quad-backend',
    script: './dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/quad/err.log',
    out_file: '/var/log/quad/out.log',
    log_file: '/var/log/quad/combined.log',
    time: true,
    max_memory_restart: '1G'
  }]
}
EOF

# Create log directory
sudo mkdir -p /var/log/quad
sudo chown $USER:$USER /var/log/quad

# Start application with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### **Step 3: Configure Nginx**
```bash
# Create Nginx configuration
sudo cat > /etc/nginx/sites-available/quad-backend << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL will be configured by Certbot

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/quad-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### **Step 4: Configure Firewall**
```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 🔧 **Environment Configuration**

### **Production Environment Variables**
Create `.env.production`:
```bash
# ================================
# SERVER CONFIGURATION
# ================================
NODE_ENV=production
PORT=3001

# ================================
# DATABASE
# ================================
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quad-production?retryWrites=true&w=majority
SKIP_INDEX_CREATION=false

# ================================
# AUTHENTICATION (Clerk)
# ================================
CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxx

# ================================
# MEDIA STORAGE (Cloudinary)
# ================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret

# ================================
# FRONTEND
# ================================
FRONTEND_URL=https://your-frontend-domain.com
```

---

## 📊 **Monitoring & Health Checks**

### **Health Check Endpoint**
Add to your `server.ts`:
```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV
  });
});
```

### **PM2 Monitoring**
```bash
# Monitor applications
pm2 status
pm2 logs quad-backend
pm2 monit

# Restart if needed
pm2 restart quad-backend

# Reload without downtime
pm2 reload quad-backend
```

### **Database Connection Monitoring**
```typescript
// Add to your database connection
mongoose.connection.on('connected', () => {
  logger.info('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});
```

---

## 🔄 **Deployment Automation**

### **GitHub Actions CI/CD**
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to Railway
      run: |
        npm install -g @railway/cli
        railway login --token ${{ secrets.RAILWAY_TOKEN }}
        railway up
```

### **Automated Backup Script**
```bash
#!/bin/bash
# backup.sh - Run daily via cron

# MongoDB backup
mongodump --uri="$MONGODB_URI" --out="/backup/$(date +%Y%m%d)"

# Compress backup
tar -czf "/backup/backup-$(date +%Y%m%d).tar.gz" "/backup/$(date +%Y%m%d)"

# Upload to cloud storage (optional)
# aws s3 cp "/backup/backup-$(date +%Y%m%d).tar.gz" s3://your-backup-bucket/

# Clean old backups (keep 7 days)
find /backup -name "backup-*.tar.gz" -mtime +7 -delete
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Application Won't Start**
```bash
# Check logs
pm2 logs quad-backend

# Check environment variables
node -e "console.log(process.env)"

# Test database connection
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('DB Connected')).catch(console.error)"
```

#### **High Memory Usage**
```bash
# Check memory usage
pm2 show quad-backend

# Restart with memory limit
pm2 restart quad-backend --max-memory-restart 1G
```

#### **SSL Certificate Issues**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal
```

#### **Database Connection Issues**
```bash
# Test MongoDB connection
mongosh "$MONGODB_URI"

# Check network connectivity
telnet your-cluster.mongodb.net 27017
```

---

## 📈 **Scaling Considerations**

### **Horizontal Scaling**
- Use load balancer (nginx, HAProxy, AWS ALB)
- Deploy multiple instances across regions
- Implement session sharing with Redis

### **Database Scaling**
- Enable MongoDB Atlas auto-scaling
- Use read replicas for read-heavy workloads
- Implement database sharding for massive datasets

### **Performance Monitoring**
- Set up APM (New Relic, Datadog, or similar)
- Monitor key metrics:
  - Response times
  - Error rates
  - Database performance
  - Memory usage
  - CPU utilization

---

## ✅ **Post-Deployment Checklist**

### **Immediate Verification (First 24 Hours)**
- [ ] All API endpoints responding correctly
- [ ] Database connections stable
- [ ] Authentication working properly
- [ ] File uploads functioning
- [ ] Socket.IO connections established
- [ ] SSL certificate valid
- [ ] Monitoring and logging active

### **Week 1 Monitoring**
- [ ] Performance metrics within acceptable ranges
- [ ] Error rates below 1%
- [ ] Database queries optimized
- [ ] Rate limiting effective
- [ ] Backup system functioning
- [ ] Security headers implemented

### **Monthly Maintenance**
- [ ] Security updates applied
- [ ] Performance review completed
- [ ] Backup restoration tested
- [ ] SSL certificates renewed (if needed)
- [ ] Database maintenance performed
- [ ] Monitoring alerts reviewed

---

This deployment guide provides multiple pathways from simple cloud deployments to full production infrastructure, ensuring you can scale your Quad backend as your user base grows.
