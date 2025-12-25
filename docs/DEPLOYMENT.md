# Deployment Guide

This guide covers deploying Freelancer Time Tracker to production, specifically targeting LWS (French hosting) with cPanel, but also includes alternatives.

## Table of Contents

- [Deployment Overview](#deployment-overview)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [LWS/cPanel Deployment](#lwscpanel-deployment)
- [Alternative Platforms](#alternative-platforms)
- [Post-Deployment](#post-deployment)
- [CI/CD Setup](#cicd-setup)
- [Rollback Procedures](#rollback-procedures)

## Deployment Overview

### Architecture

```
┌─────────────────┐
│   LWS Server    │
│   (cPanel/FTP)  │
│                 │
│  ┌───────────┐  │
│  │ Nginx/    │  │
│  │ Apache    │  │
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │   dist/   │  │ ← Static build
│  │  (Vite)   │  │
│  └───────────┘  │
└─────────────────┘
        │
        │ API calls
        ▼
┌─────────────────┐
│    Supabase     │
│     Cloud       │
│                 │
│  ┌───────────┐  │
│  │PostgreSQL │  │
│  │   Auth    │  │
│  │  Storage  │  │
│  │ Realtime  │  │
│  └───────────┘  │
└─────────────────┘
```

### Build Artifacts

- `dist/` - Main application bundle
- `dist/storybook/` - Component documentation (optional)
- `.htaccess` - Apache rewrite rules for SPA

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests pass: `npm run test`
- [ ] No TypeScript errors: `npm run typecheck`
- [ ] No ESLint errors: `npm run lint`
- [ ] Code reviewed and approved

### Environment

- [ ] Production environment variables configured
- [ ] Supabase production project created
- [ ] Database schema applied to production
- [ ] RLS policies enabled and tested
- [ ] Storage buckets created

### Build

- [ ] Production build succeeds: `npm run build`
- [ ] Build size analyzed (< 500KB gzipped)
- [ ] Critical assets checked

### Security

- [ ] No secrets in code
- [ ] Environment variables secured
- [ ] CORS configured in Supabase
- [ ] Rate limiting considered
- [ ] SSL certificate ready

## LWS/cPanel Deployment

### Step 1: Prepare Production Build

```bash
# 1. Create production environment file
cp .env.example .env.production

# 2. Edit with production values
nano .env.production
```

`.env.production` example:
```bash
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_APP_URL=https://app.yourdomain.com
VITE_APP_NAME="Freelancer Time Tracker"
```

```bash
# 3. Build for production
npm run build

# 4. Build Storybook (optional)
npm run build:storybook

# 5. Verify build
ls -lh dist/
# Should show index.html, assets/, etc.
```

### Step 2: Prepare .htaccess

Create or verify `public/.htaccess`:

```apache
# public/.htaccess
<IfModule mod_rewrite.c>
  # Enable rewrite engine
  RewriteEngine On
  RewriteBase /

  # Redirect to HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # Handle SPA routing - redirect all requests to index.html
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css
  AddOutputFilterByType DEFLATE text/javascript application/javascript application/json
  AddOutputFilterByType DEFLATE image/svg+xml
</IfModule>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On

  # Images
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"

  # CSS and JavaScript
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"

  # Fonts
  ExpiresByType font/woff "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"

  # Default
  ExpiresDefault "access plus 1 week"
</IfModule>

# Security headers
<IfModule mod_headers.c>
  # Prevent clickjacking
  Header always set X-Frame-Options "SAMEORIGIN"

  # XSS protection
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-XSS-Protection "1; mode=block"

  # Referrer policy
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Disable directory browsing
Options -Indexes

# Custom error pages (optional)
ErrorDocument 404 /index.html
```

Copy to dist:
```bash
cp public/.htaccess dist/.htaccess
```

### Step 3: Deploy Using Deployment Script

Use the automated deployment script:

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment script
./deploy.sh
```

Or manually:

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Building for production..."

# Load production environment
export $(cat .env.production | xargs)

# Install dependencies
npm ci --production=false

# Build application
npm run build

# Build Storybook (optional)
npm run build:storybook

# Copy .htaccess
cp public/.htaccess dist/.htaccess

# Create archive
echo "📦 Creating deployment archive..."
cd dist
tar -czf ../freelancer-tracker-$(date +%Y%m%d-%H%M%S).tar.gz .
cd ..

echo "✅ Build complete!"
echo "📤 Upload freelancer-tracker-*.tar.gz to your server"
```

### Step 4: Upload to LWS via FTP

#### Option A: FileZilla (GUI)

1. **Download FileZilla**: [filezilla-project.org](https://filezilla-project.org/)

2. **Configure connection**:
   - Host: `ftp.yourdomain.com` (or IP from LWS)
   - Username: Your cPanel username
   - Password: Your cPanel password
   - Port: 21

3. **Connect and upload**:
   - Navigate to `public_html/` (or your subdomain folder)
   - Upload all files from `dist/` directory
   - Preserve timestamps and permissions

#### Option B: Command Line FTP

```bash
# Connect via FTP
ftp ftp.yourdomain.com

# Login with credentials
# Username: your-cpanel-username
# Password: your-cpanel-password

# Navigate to web root
cd public_html

# Upload files (requires lftp)
lftp ftp.yourdomain.com
> login your-username your-password
> cd public_html
> mirror -R dist/ .
> bye
```

#### Option C: SSH/SCP (if enabled)

```bash
# Upload via SCP
scp -r dist/* username@yourdomain.com:~/public_html/

# Or via rsync
rsync -avz --delete dist/ username@yourdomain.com:~/public_html/
```

### Step 5: Configure cPanel

#### Create Subdomain (if needed)

1. Login to cPanel
2. Go to **Domains** → **Subdomains**
3. Create subdomain:
   - Subdomain: `app`
   - Document Root: `public_html/app` (or `public_html` for main domain)

#### SSL Certificate

1. Go to **Security** → **SSL/TLS Status**
2. Click **Run AutoSSL**
3. Wait for Let's Encrypt certificate to be issued
4. Verify HTTPS works

#### PHP Version

1. Go to **Software** → **Select PHP Version**
2. Select **PHP 8.0+** (not critical for static site, but good for tooling)

### Step 6: Configure Supabase CORS

In your Supabase project:

1. Go to **Settings** → **API**
2. Under **API Settings**, add your domain to allowed origins:
   ```
   https://app.yourdomain.com
   https://yourdomain.com
   ```

## Alternative Platforms

### Vercel (Recommended for Easy Deployment)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

**vercel.json**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

**netlify.toml**:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Cloudflare Pages

1. Connect GitHub repository
2. Configure build:
   - Build command: `npm run build`
   - Build output: `dist`
3. Add environment variables
4. Deploy

### Docker + VPS

**Dockerfile**:
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**:
```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /assets {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

Deploy:
```bash
docker build -t freelancer-tracker .
docker run -p 80:80 freelancer-tracker
```

## Post-Deployment

### Verification Checklist

- [ ] **Home page loads**: Visit your domain
- [ ] **Registration works**: Create test account
- [ ] **Login works**: Sign in with test account
- [ ] **Database connection**: Data saves correctly
- [ ] **File uploads**: Test attachment upload
- [ ] **PDF generation**: Create and download invoice
- [ ] **Real-time updates**: Test Kanban drag-drop
- [ ] **HTTPS enabled**: Check for SSL certificate
- [ ] **Mobile responsive**: Test on phone
- [ ] **Console errors**: Check browser console

### Performance Testing

```bash
# Lighthouse audit
npx lighthouse https://app.yourdomain.com --view

# Or use Chrome DevTools
# 1. Open DevTools (F12)
# 2. Go to Lighthouse tab
# 3. Run audit

# Goals:
# - Performance: > 85
# - Accessibility: > 90
# - Best Practices: > 90
# - SEO: > 90
```

### Monitoring Setup

1. **Uptime monitoring**: Use UptimeRobot or Pingdom
2. **Error tracking**: Integrate Sentry
3. **Analytics**: Add Google Analytics or Plausible
4. **Logs**: Check server logs regularly

### DNS Configuration

If using custom domain:

```
# A Record
app.yourdomain.com → LWS server IP

# Or CNAME
app.yourdomain.com → your-server.lws.fr
```

## CI/CD Setup

### GitHub Actions

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

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_APP_URL: ${{ secrets.VITE_APP_URL }}

      - name: Deploy to FTP
        uses: SamKirkland/FTP-Deploy-Action@4.3.0
        with:
          server: ftp.yourdomain.com
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./dist/
          server-dir: /public_html/
```

Add secrets in GitHub:
- Settings → Secrets → Actions
- Add: `FTP_USERNAME`, `FTP_PASSWORD`, `VITE_SUPABASE_URL`, etc.

## Rollback Procedures

### Quick Rollback

Keep previous deployments:

```bash
# Before deploying
cp -r public_html public_html.backup.$(date +%Y%m%d)

# To rollback
rm -rf public_html
mv public_html.backup.YYYYMMDD public_html
```

### Git-based Rollback

```bash
# Checkout previous version
git checkout v1.2.3

# Rebuild
npm run build

# Redeploy
./deploy.sh
```

### Database Rollback

See [DATABASE.md](./DATABASE.md) for migration rollback procedures.

## Troubleshooting Deployment Issues

### White Screen on Production

1. Check browser console for errors
2. Verify environment variables
3. Check Supabase CORS settings
4. Verify `.htaccess` is uploaded
5. Check file permissions (644 for files, 755 for directories)

### 404 on Route Refresh

- Missing or incorrect `.htaccess`
- Apache mod_rewrite not enabled
- Check server configuration

### Assets Not Loading

- Check file paths (should be relative)
- Verify base path in `vite.config.ts`
- Check CDN/proxy configuration

### Supabase Connection Failed

- Verify environment variables
- Check CORS settings in Supabase
- Verify RLS policies allow access
- Check network/firewall rules

## Additional Resources

- [LWS Documentation](https://aide.lws.fr/)
- [cPanel Documentation](https://docs.cpanel.net/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)

---

**Deployment complete! Your app is now live.**
