# Storybook Deployment Guide

## 🎨 Deploy Storybook to LWS Server

You have two options for deploying Storybook to your server.

---

## ✅ Option A: Subfolder Deployment (Recommended)

Access via: `https://freelancetracker.rolandoff.com/storybook/`

### Advantages:
- ✅ No need to create another subdomain
- ✅ Uses existing SSL certificate
- ✅ Simpler setup
- ✅ Same domain as main app

### Steps:

#### 1. Configure Storybook Base Path

Edit `.storybook/main.ts`:

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-links'
  ],
  framework: "@storybook/react-vite",
  viteFinal: async (config) => {
    // Set base path for subfolder deployment
    config.base = '/storybook/';
    return config;
  }
};
export default config;
```

#### 2. Build Storybook

```bash
npm run build-storybook
```

This creates a `storybook-static/` folder with the built files.

#### 3. Upload to Server

Upload contents of `storybook-static/` to:
```
/public_html/freelancetracker/storybook/
```

**Via FileZilla:**
1. Connect to LWS server
2. Navigate to `/public_html/freelancetracker/`
3. Create folder `storybook/` if it doesn't exist
4. Upload all files from `storybook-static/` to `storybook/`

**Via Terminal:**
```bash
scp -r storybook-static/* user@server:/public_html/freelancetracker/storybook/
```

#### 4. Access Storybook

Visit: `https://freelancetracker.rolandoff.com/storybook/`

---

## 🌐 Option B: Subdomain Deployment

Access via: `https://storybook.rolandoff.com/`

### Advantages:
- ✅ Cleaner URL
- ✅ Completely separate from main app
- ✅ Can use different authentication if needed

### Steps:

#### 1. Create Subdomain in LWS

1. Log in to LWS Panel: `https://panel.lws.fr`
2. Go to **Domaines** → **Sous-domaines**
3. Create new subdomain:
   - **Subdomain**: `storybook`
   - **Document root**: `/storybook` or `/public_html/storybook`
4. Wait 5-30 minutes for DNS propagation

#### 2. Activate SSL for Subdomain

1. **SSL/TLS** in LWS panel
2. Find `storybook.rolandoff.com`
3. Activate **Let's Encrypt** SSL
4. Wait for certificate (5-30 minutes)

#### 3. Build Storybook (No base path needed)

```bash
npm run build-storybook
```

#### 4. Upload to Server

Upload contents of `storybook-static/` to:
```
/public_html/storybook/
```

#### 5. Access Storybook

Visit: `https://storybook.rolandoff.com/`

---

## 🔄 Automated Deployment with GitHub Actions

### For Subfolder Option:

Add to `.github/workflows/deploy.yml`:

```yaml
- name: Build Storybook
  run: npm run build-storybook

- name: Deploy Storybook to LWS
  uses: SamKirkland/FTP-Deploy-Action@v4.3.5
  with:
    server: ${{ secrets.FTP_SERVER }}
    username: ${{ secrets.FTP_USERNAME }}
    password: ${{ secrets.FTP_PASSWORD }}
    local-dir: ./storybook-static/
    server-dir: /public_html/freelancetracker/storybook/
```

### For Subdomain Option:

Create separate workflow `.github/workflows/deploy-storybook.yml`:

```yaml
name: Deploy Storybook

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy-storybook:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Storybook
        run: npm run build-storybook

      - name: Deploy to LWS
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./storybook-static/
          server-dir: /public_html/storybook/
```

---

## 🔒 Optional: Password Protection

If you want to protect Storybook with a password:

### Create `.htaccess` in storybook folder:

```apache
AuthType Basic
AuthName "Storybook - Restricted Access"
AuthUserFile /path/to/.htpasswd
Require valid-user
```

### Create `.htpasswd` file:

```bash
# On your local machine or server
htpasswd -c .htpasswd username
# Enter password when prompted
```

Upload both `.htaccess` and `.htpasswd` to the storybook folder.

---

## 📝 NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

---

## ✅ Verification

After deployment:

### Subfolder Option:
1. Visit: `https://freelancetracker.rolandoff.com/storybook/`
2. Should see Storybook UI
3. Components should load correctly
4. Navigation should work

### Subdomain Option:
1. Visit: `https://storybook.rolandoff.com/`
2. Check SSL certificate (green lock)
3. Components should load correctly
4. Navigation should work

---

## 🆘 Troubleshooting

### "404 Not Found" on subfolder
**Cause**: Base path not configured or files in wrong location  
**Solution**:
- Verify `.storybook/main.ts` has `base: '/storybook/'`
- Rebuild: `npm run build-storybook`
- Check files are in `/public_html/freelancetracker/storybook/`
- Verify `index.html` exists in that folder

### Assets not loading (404)
**Cause**: Incorrect base path in build  
**Solution**:
- Verify `base: '/storybook/'` in viteFinal config
- Rebuild Storybook
- Clear browser cache

### Subdomain not working
**Cause**: DNS not propagated or subdomain not configured  
**Solution**:
- Wait 30 minutes for DNS propagation
- Verify subdomain exists in LWS panel
- Check subdomain points to correct folder
- Try `https://` not `http://`

### SSL not working on subdomain
**Cause**: SSL not activated  
**Solution**:
- Activate Let's Encrypt for subdomain in LWS panel
- Wait 5-30 minutes
- Clear browser cache

---

## 📊 Comparison

| Feature | Subfolder | Subdomain |
|---------|-----------|-----------|
| URL | `/storybook/` | `storybook.domain.com` |
| Setup complexity | ✅ Simple | ⚠️ Moderate |
| SSL needed | ❌ Uses existing | ✅ Separate cert |
| DNS config | ❌ Not needed | ✅ Required |
| Automated deploy | ✅ Same workflow | ⚠️ Separate workflow |
| Professional look | ⚠️ Good | ✅ Better |

---

## 🎯 Recommendation

**Use Subfolder Option** (`/storybook/`) because:
- ✅ Faster setup (no DNS, no SSL wait)
- ✅ Uses existing SSL certificate
- ✅ Single deployment workflow
- ✅ No extra LWS configuration

Only use subdomain if:
- You need completely separate authentication
- You want a cleaner URL for external sharing
- You have time to wait for DNS/SSL setup

---

## 📦 Current File Structure

After deployment:

### Subfolder:
```
/public_html/freelancetracker/
├── index.html           # Main app
├── assets/
├── storybook/          # Storybook files
│   ├── index.html
│   ├── iframe.html
│   └── assets/
└── .htaccess
```

### Subdomain:
```
/public_html/
├── freelancetracker/   # Main app
│   ├── index.html
│   └── assets/
└── storybook/          # Storybook (separate)
    ├── index.html
    ├── iframe.html
    └── assets/
```
