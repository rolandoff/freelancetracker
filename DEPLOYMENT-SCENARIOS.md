# Deployment Scenarios - Subdomain vs Subfolder

## ✅ Scenario A: TRUE SUBDOMAIN (Recommended)

### What it means:
- **URL**: `https://freelancetracker.yourdomain.com`
- **LWS Config**: Subdomain points to `/public_html/freelancetracker/` as document root
- **Folder structure**:
  ```
  /public_html/
  └── freelancetracker/        ← Subdomain document root
      ├── index.html
      ├── assets/
      └── .htaccess
  ```

### Changes needed: **NONE** ✅

### Files to use:
- ✅ `.htaccess.example` → Copy as `.htaccess`
- ✅ `vite.config.ts` → Keep `base` commented out
- ✅ Build normally: `npm run build`

### Why no changes?
The subdomain makes `/public_html/freelancetracker/` the **root** of your site.
From the app's perspective, it IS at `/` not `/freelancetracker/`.

---

## ⚠️ Scenario B: SUBFOLDER on Main Domain

### What it means:
- **URL**: `https://yourdomain.com/freelancetracker/`
- **Access**: Via URL path, not separate subdomain
- **Folder structure**:
  ```
  /public_html/
  ├── index.html                    ← Main domain files
  ├── other-files/
  └── freelancetracker/             ← Your app in subfolder
      ├── index.html
      ├── assets/
      └── .htaccess
  ```

### Changes needed: **YES** ⚠️

### Files to use:
- ⚠️ `.htaccess.subfolder` → Copy as `.htaccess` in `/public_html/freelancetracker/`
- ⚠️ `vite.config.ts` → Uncomment the `base: '/freelancetracker/'` line
- ⚠️ Rebuild: `npm run build`

### Steps for Subfolder Deployment:

#### 1. Update vite.config.ts
```typescript
export default defineConfig({
  plugins: [react()],
  base: '/freelancetracker/',  // ← UNCOMMENT THIS
  // ... rest of config
})
```

#### 2. Rebuild
```bash
npm run build
```

#### 3. Use correct .htaccess
```bash
# Copy the subfolder version
cp .htaccess.subfolder /path/to/server/public_html/freelancetracker/.htaccess
```

#### 4. Upload to subfolder
Upload `dist/` contents to `/public_html/freelancetracker/`

---

## 🎯 How to Know Which Scenario You Have?

### You have Scenario A (Subdomain) if:
- ✅ You configured a subdomain in LWS panel (Domaines → Sous-domaines)
- ✅ The subdomain DNS points to the `freelancetracker` folder
- ✅ You access via: `subdomain.domain.com`

### You have Scenario B (Subfolder) if:
- ⚠️ You did NOT create a subdomain in LWS
- ⚠️ You just uploaded files to a folder
- ⚠️ You access via: `domain.com/foldername/`

---

## 📊 Comparison Table

| Aspect | Subdomain (A) | Subfolder (B) |
|--------|---------------|---------------|
| URL | `tracker.domain.com` | `domain.com/tracker/` |
| LWS Config | Subdomain created | Just upload files |
| vite.config base | Commented out | `/tracker/` |
| .htaccess file | `.htaccess.example` | `.htaccess.subfolder` |
| RewriteBase | `/` | `/tracker/` |
| Rebuild needed | No | Yes |
| Complexity | Simple ✅ | More complex ⚠️ |

---

## 🚀 Recommended Approach

**Use Scenario A (True Subdomain)** because:
- ✅ No config changes needed
- ✅ Simpler deployment
- ✅ Better for SPAs
- ✅ Cleaner URLs
- ✅ Easier to maintain

### How to Create Subdomain in LWS:
1. Log into LWS Panel
2. Go to **Domaines** → **Sous-domaines**
3. Create subdomain: `freelancetracker`
4. Point it to folder: `/freelancetracker/`
5. Save and wait for DNS propagation (5-30 minutes)

---

## 🧪 Testing Your Deployment

### After uploading:

**Subdomain deployment:**
```
https://freelancetracker.yourdomain.com
→ Should load app ✅
```

**Subfolder deployment:**
```
https://yourdomain.com/freelancetracker/
→ Should load app ✅
```

### Common Issues:

#### CSS/JS not loading:
- **Subdomain**: Check `.htaccess` RewriteBase is `/`
- **Subfolder**: Check vite `base` config and rebuild

#### Blank page:
- Open DevTools → Console
- Check for 404 errors on assets
- Verify base path matches URL structure

#### 404 on refresh:
- `.htaccess` missing or incorrect
- RewriteBase doesn't match actual path

---

## 📞 Need Help?

1. Check which scenario you have
2. Verify URL structure matches expected
3. Check browser DevTools for asset loading errors
4. Verify `.htaccess` is uploaded and correct
