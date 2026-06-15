# AI Infrastructure DDS - Setup & Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Web server (for production)
- Node.js (optional, for build tools)

### Local Development

1. **Clone/Download the project**
```bash
cd /path/to/ai-infrastructure-dds
```

2. **Start a local server**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js http-server
npx http-server

# Or use any other local server
```

3. **Open in browser**
```
http://localhost:8000
```

4. **Access Debug Panel** (Development only)
- Press 🔧 button in bottom-right corner
- Or open browser console (F12)

---

## 📊 File Structure

```
ai-infrastructure-dds/
├── index.html              # Login/Register page
├── dashboard.html          # Main dashboard
├── inspect.html            # Inspection form
├── reports.html            # Reports management
├── kanban.html             # Kanban board
├── script.js               # Main app logic (enhanced version)
├── script-enhanced.js      # Enhanced features (backup)
├── style.css               # Complete styling
├── sw.js                   # Service worker (PWA)
├── README.md               # Full documentation
├── DEPLOYMENT.md           # This file
├── assets/
│   └── infrasture-bg.jpeg  # Background image
└── .git/                   # Version control
```

---

## 🔧 Key Features Enabled

### ✅ Production Features
- ✅ Advanced logging with error tracking
- ✅ Input validation framework
- ✅ Performance monitoring
- ✅ Enhanced PWA with background sync
- ✅ State management system
- ✅ Data compression for storage
- ✅ Offline support with caching
- ✅ Accessibility improvements (WCAG 2.1)
- ✅ Debug panel (development only)

### 📱 Responsive Design
- Desktop: Full layout (1920x1080+)
- Tablet: 2-column layout (768px - 1024px)
- Mobile: 1-column stacked (< 768px)

### 🌐 Browser Support
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 🔒 Security Checklist

Before deployment:

- [ ] Update API endpoints to production URLs
- [ ] Enable HTTPS only
- [ ] Configure CORS headers properly
- [ ] Set Content-Security-Policy headers
- [ ] Remove debug panel from production
- [ ] Update database connection strings
- [ ] Configure environment variables
- [ ] Enable error logging service
- [ ] Set up rate limiting
- [ ] Configure backup strategy

### Recommended Headers
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
X-XSS-Protection: 1; mode=block
```

---

## 📦 Production Deployment

### Option 1: Static Hosting (GitHub Pages, Netlify, Vercel)

1. **Push to GitHub**
```bash
git add .
git commit -m "Deploy enhanced version"
git push origin main
```

2. **Enable GitHub Pages**
   - Settings → Pages
   - Select main branch
   - Wait for deployment

3. **Custom domain**
   - Add DNS CNAME
   - Update GitHub Pages settings

### Option 2: Traditional Web Server

1. **Copy files to server**
```bash
scp -r ai-infrastructure-dds/* user@server:/var/www/dds/
```

2. **Configure web server**
```nginx
server {
    listen 443 ssl http2;
    server_name dds.example.com;

    # SSL certificates
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Root directory
    root /var/www/dds;

    # Index file
    index index.html;

    # Cache headers
    location ~* \.(js|css|jpg|jpeg|png|gif|ico|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Service Worker
    location = /sw.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

3. **Enable HTTPS**
```bash
# Using Let's Encrypt
certbot certonly --webroot -w /var/www/dds -d dds.example.com
```

### Option 3: Docker

1. **Create Dockerfile**
```dockerfile
FROM nginx:alpine

COPY . /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

2. **Build and run**
```bash
docker build -t dds:latest .
docker run -d -p 80:80 -p 443:443 dds:latest
```

---

## 🔄 Updates & Maintenance

### Service Worker Updates

When pushing new code:

1. **Increment cache version**
```javascript
// sw.js
const CACHE_NAME = "dds-v3"; // Changed from v2
```

2. **Force update on clients**
```javascript
// In script.js
if (navigator.serviceWorker && 'controller' in navigator.serviceWorker) {
  navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
}
```

### Database Maintenance
```sql
-- Clear old inspections (keep last 1000)
DELETE FROM inspections 
WHERE id NOT IN (
  SELECT id FROM inspections 
  ORDER BY date DESC 
  LIMIT 1000
);

-- Archive inspections
INSERT INTO inspections_archive 
SELECT * FROM inspections WHERE date < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

### Backup Strategy
```bash
# Daily backups
0 2 * * * tar -czf /backups/dds-$(date +%Y%m%d).tar.gz /var/www/dds/

# Weekly database backup
0 3 * * 0 mysqldump -u root -p dds > /backups/dds-db-$(date +%Y%m%d).sql
```

---

## 🧪 Testing

### Manual Testing Checklist

**Functionality**
- [ ] Login/Register works
- [ ] Dashboard loads with data
- [ ] Inspection form submits
- [ ] Image upload works
- [ ] Cost calculation is accurate
- [ ] Reports export (CSV, PDF, Excel)
- [ ] Kanban drag-drop works
- [ ] Theme toggle works
- [ ] Language selector updates UI

**Offline**
- [ ] Open in offline mode
- [ ] All pages load
- [ ] Forms save to localStorage
- [ ] Auto-syncs when online

**Performance**
- [ ] Page loads in < 2s
- [ ] Smooth animations
- [ ] No memory leaks
- [ ] Mobile smooth at 60fps

**Accessibility**
- [ ] Tab navigation works
- [ ] Screen reader compatible
- [ ] Keyboard shortcuts work
- [ ] Color contrast sufficient
- [ ] Skip links functional

### Automated Testing
```bash
# Lighthouse audit
lighthouse http://localhost:8000 --view

# Performance testing
npm run perf-test

# Accessibility testing
npm run a11y-test
```

### Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 100 http://localhost:8000/

# Using wrk
wrk -t12 -c400 -d30s http://localhost:8000/
```

---

## 📊 Monitoring & Logs

### Client-side Monitoring

**Enable debug mode:**
```javascript
// In console
Logger.level = Logger.levels.DEBUG;
Logger.getLogs();
Logger.downloadLogs();
```

**Check storage usage:**
```javascript
DDS.storage.getStorageInfo();
```

**Check performance:**
```javascript
PerformanceMonitor.getMetrics();
```

### Server-side Monitoring

**Log locations:**
- `error.log` - Application errors
- `access.log` - HTTP requests
- `slowlog.log` - Slow queries

**Monitor commands:**
```bash
# Real-time logs
tail -f /var/log/nginx/access.log

# Error count by hour
grep "ERROR" /var/log/dds/error.log | cut -d: -f1-2 | uniq -c

# Slow API calls
grep "response_time > 1000" /var/log/dds/api.log
```

---

## 🐛 Troubleshooting

### Service Worker Not Updating
```bash
# Force service worker re-registration
localStorage.clear()
caches.keys().then(names => {
  Promise.all(names.map(name => caches.delete(name)))
})
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister())
})
```

### Storage Quota Exceeded
```javascript
// Check usage
DDS.storage.getStorageInfo()

// Clear old data
DDS.storage.clearOldData()

// Export before clearing
DDS.export.toJSON()
```

### CORS Issues
```javascript
// Check headers in server response
fetch('http://api.example.com/data')
  .then(res => {
    console.log(res.headers)
    return res.json()
  })
```

### Performance Issues
```javascript
// Profile code
console.time('operation')
// ... code ...
console.timeEnd('operation')

// Memory check
performance.memory
```

---

## 📈 Scaling

### Optimization
1. Implement IndexedDB for larger datasets
2. Use Web Workers for heavy computations
3. Implement virtual scrolling for large lists
4. Use Service Worker for complex caching
5. Compress assets with gzip/brotli

### Backend Services
- Implement API caching (Redis)
- Use CDN for static assets
- Database indexing optimization
- Load balancing across servers

### Database
```sql
-- Add indexes
CREATE INDEX idx_inspections_city ON inspections(city);
CREATE INDEX idx_inspections_date ON inspections(date);
CREATE INDEX idx_inspections_status ON inspections(status);

-- Partitioning
ALTER TABLE inspections PARTITION BY RANGE (YEAR(date)) (
  PARTITION p2024 VALUES LESS THAN (2025),
  PARTITION p2025 VALUES LESS THAN (2026),
  PARTITION pfuture VALUES LESS THAN MAXVALUE
);
```

---

## 📞 Support & Contact

### Issues & Bugs
- GitHub Issues: `/issues`
- Email: support@dds.local

### Documentation
- Full Docs: `/README.md`
- API Reference: `/API.md`
- Deployment: `/DEPLOYMENT.md`

### Version Info
- Current: v2.1.0
- Stable: v2.0.0
- Legacy: v1.0.0

---

## 📋 Checklist Before Going Live

- [ ] All tests passing
- [ ] Security headers configured
- [ ] SSL/HTTPS enabled
- [ ] Database backed up
- [ ] Monitoring configured
- [ ] Error tracking enabled
- [ ] Performance optimized
- [ ] Documentation updated
- [ ] Team trained
- [ ] Rollback plan ready

---

## 🔐 Emergency Procedures

### Immediate Shutdown
```bash
# Stop service
systemctl stop dds

# Disable from load balancer
# Remove from DNS
```

### Data Recovery
```bash
# Restore from backup
tar -xzf /backups/dds-latest.tar.gz -C /var/www/

# Restore database
mysql dds < /backups/dds-db-latest.sql
```

### Rollback
```bash
# Previous version
git checkout v2.0.0

# Deploy
./deploy.sh
```

---

*Last Updated: 2026-06-15*
*Document Version: 2.1*
