# CDN Configuration Guide

This document provides guidance on configuring a Content Delivery Network (CDN) for the Quad platform.

## Overview

A CDN improves performance by:

- Caching static assets closer to users
- Reducing server load
- Improving page load times
- Providing DDoS protection

## Recommended CDN Providers

### Cloudflare (Recommended)

- Free tier available
- Easy setup with DNS
- Built-in DDoS protection
- Automatic HTTPS
- Web Application Firewall (WAF)

### AWS CloudFront

- Integrates well with AWS infrastructure
- Pay-as-you-go pricing
- Global edge locations
- Advanced caching rules

### Vercel Edge Network

- Automatic for Vercel deployments
- Zero configuration
- Optimized for Next.js/React

## Cloudflare Setup (Recommended)

### 1. Sign Up and Add Site

1. Create account at [cloudflare.com](https://cloudflare.com)
2. Add your domain
3. Update nameservers at your domain registrar
4. Wait for DNS propagation (usually < 24 hours)

### 2. Configure SSL/TLS

1. Go to SSL/TLS settings
2. Set encryption mode to "Full (strict)"
3. Enable "Always Use HTTPS"
4. Enable "Automatic HTTPS Rewrites"

### 3. Configure Caching

#### Page Rules

Create page rules for different content types:

**Static Assets (High Cache)**

- URL Pattern: `*.yourproductiondomain.com/assets/*`
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
- Browser Cache TTL: 1 year

**API Endpoints (No Cache)**

- URL Pattern: `api.yourproductiondomain.com/api/*`
- Cache Level: Bypass
- Disable Performance features

**Frontend Pages (Smart Cache)**

- URL Pattern: `*.yourproductiondomain.com/*`
- Cache Level: Standard
- Edge Cache TTL: 2 hours
- Browser Cache TTL: 4 hours

#### Caching Configuration

1. Go to Caching → Configuration
2. Set Caching Level: Standard
3. Enable "Respect Existing Headers"
4. Browser Cache TTL: 4 hours (default)

### 4. Performance Optimizations

Enable these features:

- **Auto Minify**: HTML, CSS, JavaScript
- **Brotli Compression**: Enabled
- **HTTP/2**: Enabled
- **HTTP/3 (QUIC)**: Enabled
- **0-RTT Connection Resumption**: Enabled

### 5. Security Settings

- **Security Level**: Medium
- **Challenge Passage**: 30 minutes
- **Browser Integrity Check**: Enabled
- **Privacy Pass Support**: Enabled

### 6. Firewall Rules

Create rules to protect your API:

**Rate Limiting**

```
(http.request.uri.path contains "/api/") and
(rate(1m) > 100)
```

Action: Challenge

**Block Bad Bots**

```
(cf.client.bot) and not (cf.verified_bot_category in {"Search Engine Crawler"})
```

Action: Block

## Cache Headers Strategy

The backend implements cache headers for different content types:

### Static Assets

```
Cache-Control: public, max-age=31536000, immutable
```

- Cached for 1 year
- Immutable (won't change)
- Examples: JS bundles, CSS files, images with hashes

### API Responses (Public Data)

```
Cache-Control: public, max-age=300, stale-while-revalidate=60
```

- Cached for 5 minutes
- Serve stale for 1 minute while revalidating
- Examples: Public posts, user profiles

### API Responses (User-Specific)

```
Cache-Control: private, max-age=60, must-revalidate
```

- Cached only in browser (not CDN)
- Cached for 1 minute
- Must revalidate when stale
- Examples: User feed, notifications

### No Cache (Dynamic Data)

```
Cache-Control: no-cache, no-store, must-revalidate
```

- Never cached
- Always fetch fresh
- Examples: Authentication endpoints, real-time data

## Purging Cache

### Cloudflare Purge

**Purge Everything**

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

**Purge Specific URLs**

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://yourproductiondomain.com/path/to/file"]}'
```

**Purge by Tag**

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"tags":["api-responses"]}'
```

## Testing Cache Configuration

### Check Cache Headers

```bash
curl -I https://yourproductiondomain.com/assets/main.js
```

Look for:

- `Cache-Control` header
- `CF-Cache-Status` (Cloudflare)
- `X-Cache` (other CDNs)
- `Age` header (time in cache)

### Cache Status Values

- `HIT`: Served from cache
- `MISS`: Not in cache, fetched from origin
- `EXPIRED`: Was in cache but expired
- `STALE`: Serving stale while revalidating
- `BYPASS`: Cache bypassed
- `DYNAMIC`: Dynamic content, not cached

## Best Practices

### 1. Use Cache Busting

Add version/hash to static asset URLs:

```
/assets/main.abc123.js
```

### 2. Set Appropriate TTLs

- Static assets: 1 year
- API responses: 5-60 minutes
- HTML pages: 1-4 hours
- User-specific data: Private cache only

### 3. Use Stale-While-Revalidate

Serve stale content while fetching fresh:

```
Cache-Control: max-age=300, stale-while-revalidate=60
```

### 4. Vary by Headers

Tell caches to vary responses:

```
Vary: Authorization, Accept-Encoding
```

### 5. Use ETags

Enable conditional requests:

```
ETag: "abc123"
```

Client sends:

```
If-None-Match: "abc123"
```

Server responds with 304 Not Modified if unchanged.

### 6. Compress Responses

Enable compression at CDN level:

- Gzip for older browsers
- Brotli for modern browsers

### 7. Monitor Cache Performance

Track metrics:

- Cache hit ratio
- Origin requests
- Bandwidth savings
- Response times

## Troubleshooting

### Cache Not Working

1. Check `Cache-Control` headers from origin
2. Verify CDN caching rules
3. Check for `Set-Cookie` headers (prevents caching)
4. Verify URL patterns in CDN rules

### Stale Content

1. Purge cache manually
2. Check cache TTL settings
3. Verify cache busting is working
4. Check if `must-revalidate` is needed

### CORS Issues with CDN

1. Ensure `Access-Control-Allow-Origin` is set
2. Add `Vary: Origin` header
3. Configure CDN to forward CORS headers
4. Test with and without CDN

## Service Worker (Optional)

For advanced caching in the browser, implement a service worker:

```javascript
// Cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("static-v1").then((cache) => {
      return cache.addAll(["/", "/assets/main.js", "/assets/main.css"]);
    })
  );
});

// Serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

## Monitoring

### Cloudflare Analytics

Monitor:

- Requests
- Bandwidth
- Cache hit ratio
- Threats blocked
- Performance metrics

### Custom Monitoring

Add cache headers to responses:

```typescript
res.setHeader("X-Cache-Status", cacheStatus);
res.setHeader("X-Cache-Age", age);
```

Track in analytics:

- Cache hit rate
- Average response time
- Bandwidth savings

## Cost Optimization

### Cloudflare Free Tier

Includes:

- Unlimited bandwidth
- Basic DDoS protection
- Shared SSL certificate
- Basic caching

### Paid Features (Optional)

- Advanced DDoS protection
- Image optimization
- Load balancing
- Rate limiting
- WAF rules

## Conclusion

Proper CDN configuration can significantly improve performance and reduce costs. Start with Cloudflare's free tier and upgrade as needed based on traffic and requirements.
