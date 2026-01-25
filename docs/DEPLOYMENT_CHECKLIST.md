# Production Deployment Checklist

Use this checklist to ensure all steps are completed before and after deployment.

## Pre-Deployment Checklist

### Code Quality

- [ ] All unit tests passing
- [ ] All property-based tests passing
- [ ] All integration tests passing
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Code reviewed and approved
- [ ] All TODO comments addressed or documented

### Environment Configuration

- [ ] Production environment variables documented
- [ ] `.env.production` files created for frontend and backend
- [ ] All required environment variables set
- [ ] Sensitive keys rotated from development
- [ ] Environment variable validation tested

### External Services

#### MongoDB

- [ ] Production database created
- [ ] Database user created with appropriate permissions
- [ ] IP whitelist configured
- [ ] Connection string tested
- [ ] Indexes created
- [ ] Backup strategy configured

#### Clerk Authentication

- [ ] Production application created
- [ ] Publishable key and secret key obtained
- [ ] Redirect URLs configured
- [ ] Webhook endpoint configured
- [ ] Webhook signing secret obtained
- [ ] Test authentication flow

#### Cloudinary

- [ ] Production account configured
- [ ] Cloud name, API key, and secret obtained
- [ ] Upload presets configured (if needed)
- [ ] Storage limits reviewed
- [ ] Test image upload

#### Sentry (Optional)

- [ ] Production project created
- [ ] DSN obtained
- [ ] Source maps upload configured
- [ ] Test error reporting

#### Google Analytics (Optional)

- [ ] Property created
- [ ] Measurement ID obtained
- [ ] Test event tracking

### Security

- [ ] HTTPS configured
- [ ] SSL certificates obtained
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] Sensitive data not logged
- [ ] API keys not exposed in frontend
- [ ] Security headers configured

### Performance

- [ ] Code splitting implemented
- [ ] Lazy loading configured
- [ ] Images optimized
- [ ] Bundle size analyzed
- [ ] Caching strategy configured
- [ ] CDN configured (optional)
- [ ] Database queries optimized
- [ ] Indexes created

### Build Process

- [ ] Frontend builds successfully
- [ ] Backend builds successfully
- [ ] Build artifacts tested locally
- [ ] Source maps generated
- [ ] Production build optimized
- [ ] Dead code eliminated

## Deployment Checklist

### Frontend Deployment

- [ ] Environment variables configured in hosting platform
- [ ] Build command configured: `npm run build:production`
- [ ] Output directory configured: `dist`
- [ ] Node version specified: `18.x`
- [ ] Custom domain configured
- [ ] DNS records updated
- [ ] SSL certificate active
- [ ] Deployment successful
- [ ] Frontend accessible at production URL

### Backend Deployment

- [ ] Environment variables configured in hosting platform
- [ ] Build command configured: `npm run build:production`
- [ ] Start command configured: `npm run start:production`
- [ ] Node version specified: `18.x`
- [ ] Port configured: `4000`
- [ ] Health check endpoint configured: `/health`
- [ ] Custom domain configured (api subdomain)
- [ ] DNS records updated
- [ ] SSL certificate active
- [ ] Deployment successful
- [ ] Backend accessible at production URL

### Database

- [ ] Connection successful from backend
- [ ] Indexes created
- [ ] Initial data seeded (if needed)
- [ ] Backup configured
- [ ] Monitoring enabled

## Post-Deployment Checklist

### Verification

#### Health Checks

- [ ] `/health` endpoint returns 200
- [ ] `/health/detailed` shows all services up
- [ ] `/health/ready` returns 200
- [ ] `/health/live` returns 200

#### Frontend

- [ ] Homepage loads
- [ ] Assets load correctly
- [ ] No console errors
- [ ] No 404 errors
- [ ] Routing works correctly
- [ ] Theme switching works
- [ ] Responsive design works

#### Authentication

- [ ] Sign up works
- [ ] Sign in works
- [ ] Sign out works
- [ ] Protected routes redirect to login
- [ ] JWT tokens issued correctly
- [ ] Token refresh works

#### Core Features

- [ ] Create post works
- [ ] View posts works
- [ ] Edit post works
- [ ] Delete post works
- [ ] Upload image works
- [ ] Create story works
- [ ] Create poll works
- [ ] Vote on poll works

#### Social Features

- [ ] Follow user works
- [ ] Unfollow user works
- [ ] View profile works
- [ ] Edit profile works
- [ ] View followers works
- [ ] View following works

#### Engagement

- [ ] Add reaction works
- [ ] Remove reaction works
- [ ] Add comment works
- [ ] Like comment works

#### Real-time Features

- [ ] Chat messages send
- [ ] Chat messages receive
- [ ] Typing indicators work
- [ ] Notifications appear
- [ ] Feed updates in real-time
- [ ] Poll votes update in real-time

### Monitoring Setup

- [ ] Error tracking active (Sentry)
- [ ] Analytics tracking active (Google Analytics)
- [ ] Server monitoring configured
- [ ] Uptime monitoring configured
- [ ] Log aggregation configured
- [ ] Alert rules configured
- [ ] Dashboard created

### Performance

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] API response time < 200ms
- [ ] Database query time < 100ms
- [ ] No memory leaks
- [ ] No performance warnings

### Security

- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] CORS configured correctly
- [ ] Rate limiting working
- [ ] No sensitive data exposed
- [ ] No XSS vulnerabilities
- [ ] No CSRF vulnerabilities
- [ ] Authentication secure

### Backup & Recovery

- [ ] Database backup configured
- [ ] Backup schedule set
- [ ] Backup tested
- [ ] Recovery procedure documented
- [ ] Backup retention policy set

### Documentation

- [ ] Deployment documented
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Troubleshooting guide created
- [ ] Runbook created
- [ ] Contact information updated

## Post-Launch Monitoring (First 24 Hours)

### Hour 1

- [ ] Check error rates
- [ ] Check response times
- [ ] Check user registrations
- [ ] Check real-time features
- [ ] Review logs

### Hour 6

- [ ] Review error tracking
- [ ] Check database performance
- [ ] Check API performance
- [ ] Review user feedback
- [ ] Check uptime

### Hour 24

- [ ] Review analytics
- [ ] Check error trends
- [ ] Review performance metrics
- [ ] Check backup completion
- [ ] Document any issues

## Rollback Plan

If critical issues occur:

- [ ] Rollback procedure documented
- [ ] Previous version tagged in Git
- [ ] Database migration rollback tested
- [ ] Rollback contact list created
- [ ] Rollback decision criteria defined

### Rollback Triggers

Roll back if:

- [ ] Error rate > 5%
- [ ] Response time > 2x normal
- [ ] Critical feature broken
- [ ] Security vulnerability discovered
- [ ] Data corruption detected

### Rollback Steps

1. [ ] Notify team
2. [ ] Stop new deployments
3. [ ] Revert to previous version
4. [ ] Verify rollback successful
5. [ ] Monitor for stability
6. [ ] Document incident
7. [ ] Plan fix and re-deployment

## Sign-Off

### Technical Lead

- [ ] Code review complete
- [ ] Tests passing
- [ ] Security review complete
- [ ] Performance acceptable

**Signed:** **\*\*\*\***\_**\*\*\*\*** **Date:** \***\*\_\*\***

### DevOps

- [ ] Infrastructure ready
- [ ] Monitoring configured
- [ ] Backups configured
- [ ] Deployment successful

**Signed:** **\*\*\*\***\_**\*\*\*\*** **Date:** \***\*\_\*\***

### Product Owner

- [ ] Features verified
- [ ] User acceptance complete
- [ ] Documentation complete
- [ ] Ready for launch

**Signed:** **\*\*\*\***\_**\*\*\*\*** **Date:** \***\*\_\*\***

## Notes

Use this section to document any deployment-specific notes, issues encountered, or deviations from the standard process:

---

**Deployment Date:** **\*\*\*\***\_**\*\*\*\***

**Deployed By:** **\*\*\*\***\_**\*\*\*\***

**Version:** **\*\*\*\***\_**\*\*\*\***

**Notes:**
