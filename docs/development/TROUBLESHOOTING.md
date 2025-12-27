# Troubleshooting Guide

Common issues and solutions for Freelancer Time Tracker.

## Table of Contents

- [Development Issues](#development-issues)
- [Build Issues](#build-issues)
- [Supabase Issues](#supabase-issues)
- [Authentication Issues](#authentication-issues)
- [Database Issues](#database-issues)
- [Frontend Issues](#frontend-issues)
- [Deployment Issues](#deployment-issues)
- [Performance Issues](#performance-issues)

## Development Issues

### Port Already in Use

**Problem**: `Error: Port 5173 is already in use`

**Solution**:
```bash
# Option 1: Kill process using the port
lsof -ti:5173 | xargs kill

# Option 2: Use different port
npm run dev -- --port 3000

# Option 3: Find and kill manually
lsof -i :5173
# Note the PID, then:
kill -9 <PID>
```

### Module Not Found

**Problem**: `Error: Cannot find module '@/components/ui/button'`

**Solutions**:

1. **Clear node_modules and reinstall**:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

2. **Check TypeScript path aliases**:
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

3. **Check Vite config**:
```typescript
// vite.config.ts
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Hot Reload Not Working

**Problem**: Changes not reflecting in browser

**Solutions**:

1. **Clear Vite cache**:
```bash
rm -rf node_modules/.vite
npm run dev
```

2. **Check file watchers limit** (Linux):
```bash
# Increase limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

3. **Hard refresh browser**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)

### TypeScript Errors

**Problem**: `Type 'X' is not assignable to type 'Y'`

**Solutions**:

1. **Regenerate Supabase types**:
```bash
supabase gen types typescript --project-id <id> > src/types/database.types.ts
```

2. **Check for type mismatches**:
```typescript
// Make sure to use correct types
import type { Database } from '@/types/database.types';

type Client = Database['public']['Tables']['clients']['Row'];
```

3. **Clear TypeScript cache**:
```bash
rm -rf node_modules/.cache
npm run typecheck
```

## Build Issues

### Build Fails with Memory Error

**Problem**: `JavaScript heap out of memory`

**Solution**:
```bash
# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Build Size Too Large

**Problem**: Build exceeds size limits

**Solutions**:

1. **Analyze bundle**:
```bash
npm run build -- --mode analyze
```

2. **Enable code splitting**:
```typescript
// Use dynamic imports
const InvoicePDF = lazy(() => import('@/features/invoices/components/InvoicePDF'));
```

3. **Optimize dependencies**:
```bash
# Remove unused dependencies
npm run depcheck
npx depcheck
```

### Build Fails on Import

**Problem**: `Failed to resolve import`

**Solutions**:

1. **Check file extensions**:
```typescript
// Don't include .tsx in imports
import { Button } from './Button'; // ✅
import { Button } from './Button.tsx'; // ❌
```

2. **Check case sensitivity**:
```typescript
// File: ClientForm.tsx
import { ClientForm } from './ClientForm'; // ✅
import { ClientForm } from './clientform'; // ❌ (on Linux/Mac)
```

## Supabase Issues

### Connection Refused

**Problem**: `Error: connect ECONNREFUSED`

**Solutions**:

1. **Check environment variables**:
```bash
# Verify in .env.local
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

2. **Check Supabase project status**:
   - Go to dashboard
   - Check if project is paused
   - Restore if needed

3. **Check network/firewall**:
```bash
# Test connection
curl https://your-project.supabase.co

# If fails, check firewall/proxy settings
```

### CORS Errors

**Problem**: `Access-Control-Allow-Origin` error

**Solutions**:

1. **Configure CORS in Supabase**:
   - Go to Settings → API
   - Add your domain to allowed origins:
     ```
     http://localhost:5173
     https://app.yourdomain.com
     ```

2. **Check request origin**:
```typescript
// Ensure requests use correct URL
const { data } = await supabase.from('clients').select();
// Not: await fetch('https://xxx.supabase.co/...')
```

### RLS Policy Errors

**Problem**: `new row violates row-level security policy`

**Solutions**:

1. **Check if RLS is enabled**:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

2. **Verify policy exists**:
```sql
SELECT policyname, tablename
FROM pg_policies
WHERE schemaname = 'public';
```

3. **Test policy**:
```sql
-- Simulate user context
SET request.jwt.claim.sub = 'user-uuid';
SELECT * FROM clients; -- Should only return user's data
RESET request.jwt.claim.sub;
```

4. **Add missing user_id**:
```typescript
// Ensure user_id is included in inserts
const { data, error } = await supabase
  .from('clients')
  .insert({
    name: 'Test',
    user_id: user.id, // ← Make sure this is included!
  });
```

## Authentication Issues

### Session Not Persisting

**Problem**: User logged out after refresh

**Solutions**:

1. **Check Supabase client config**:
```typescript
export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true, // ← Ensure this is true
    autoRefreshToken: true,
  },
});
```

2. **Check localStorage**:
```javascript
// In browser console
localStorage.getItem('supabase.auth.token');
// Should return a token
```

3. **Clear old sessions**:
```typescript
await supabase.auth.signOut();
localStorage.clear();
// Then login again
```

### Email Not Sending

**Problem**: Registration email not received

**Solutions**:

1. **Check spam folder**

2. **Check Supabase email settings**:
   - Go to Authentication → Email Templates
   - Verify SMTP configured or using Supabase default

3. **Check rate limits**:
   - Supabase limits email sends
   - Wait a few minutes and retry

4. **Use development mode**:
```typescript
// In development, check Supabase logs for magic link
// Settings → Logs → Auth logs
```

### Token Expired

**Problem**: `JWT expired` error

**Solution**:
```typescript
// Token refresh should be automatic
// If not, manually refresh:
const { data, error } = await supabase.auth.refreshSession();

// Or sign out and back in
await supabase.auth.signOut();
```

## Database Issues

### Foreign Key Violation

**Problem**: `violates foreign key constraint`

**Solutions**:

1. **Ensure referenced record exists**:
```typescript
// Check if client exists before creating activity
const { data: client } = await supabase
  .from('clients')
  .select('id')
  .eq('id', clientId)
  .single();

if (!client) {
  throw new Error('Client not found');
}
```

2. **Use transactions** (if needed):
```sql
BEGIN;
INSERT INTO clients (...) VALUES (...);
INSERT INTO projects (client_id, ...) VALUES (lastval(), ...);
COMMIT;
```

### Unique Constraint Violation

**Problem**: `duplicate key value violates unique constraint`

**Solutions**:

1. **Check existing records**:
```typescript
const { data: existing } = await supabase
  .from('clients')
  .select('siret')
  .eq('siret', siret)
  .single();

if (existing) {
  throw new Error('SIRET already exists');
}
```

2. **Handle upserts**:
```typescript
const { data, error } = await supabase
  .from('rates')
  .upsert({
    user_id: userId,
    service_type: 'programacion',
    hourly_rate: 50,
  });
```

### Query Performance Issues

**Problem**: Queries taking too long

**Solutions**:

1. **Add indexes**:
```sql
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_time_entries_date ON time_entries(start_time);
```

2. **Optimize queries**:
```typescript
// Bad - N+1 query
const activities = await getActivities();
for (const activity of activities) {
  const client = await getClient(activity.client_id);
}

// Good - Single query with join
const { data } = await supabase
  .from('activities')
  .select(`
    *,
    client:clients(*)
  `);
```

3. **Use pagination**:
```typescript
const { data } = await supabase
  .from('activities')
  .select('*')
  .range(0, 49) // First 50 records
  .limit(50);
```

## Frontend Issues

### White Screen

**Problem**: Blank page with no errors

**Solutions**:

1. **Check browser console**:
   - Open DevTools (F12)
   - Look for JavaScript errors
   - Check Network tab for failed requests

2. **Check environment variables**:
```bash
# Ensure they're prefixed with VITE_
VITE_SUPABASE_URL=...  # ✅
SUPABASE_URL=...       # ❌ Won't work
```

3. **Clear cache**:
```bash
rm -rf node_modules/.vite dist
npm run build
```

### Component Not Rendering

**Problem**: Component returns null or empty

**Solutions**:

1. **Check conditional rendering**:
```typescript
// Add loading state
if (isLoading) return <Spinner />;
if (error) return <Error message={error.message} />;
if (!data) return null;
```

2. **Check data structure**:
```typescript
// Log data to verify structure
console.log('Data:', data);
```

3. **Check React keys**:
```typescript
// Ensure unique keys
{items.map(item => (
  <div key={item.id}> {/* ← Must be unique */}
    {item.name}
  </div>
))}
```

### Infinite Loop / Too Many Renders

**Problem**: Component keeps re-rendering

**Solutions**:

1. **Check useEffect dependencies**:
```typescript
// Bad - missing dependencies
useEffect(() => {
  fetchData();
}, []); // ❌ fetchData should be in deps

// Good
useEffect(() => {
  fetchData();
}, [fetchData]);

// Or use useCallback
const fetchData = useCallback(async () => {
  // ...
}, []);
```

2. **Check state updates**:
```typescript
// Bad - causes infinite loop
useEffect(() => {
  setData([...data, newItem]); // ❌ Updates data, triggers effect
}, [data]);

// Good - use functional update
setData(prev => [...prev, newItem]);
```

## Deployment Issues

### 404 on Page Refresh

**Problem**: SPA routes return 404 on direct access

**Solutions**:

1. **Verify .htaccess exists**:
```bash
ls -la dist/.htaccess
```

2. **Check .htaccess content**:
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

3. **Check Apache mod_rewrite**:
```bash
# Ensure mod_rewrite is enabled
a2enmod rewrite
service apache2 restart
```

### Assets Not Loading

**Problem**: CSS/JS files 404

**Solutions**:

1. **Check base path**:
```typescript
// vite.config.ts
export default defineConfig({
  base: '/', // or '/app/' if deployed to subdirectory
});
```

2. **Check file paths**:
```typescript
// Use relative imports
import logo from './logo.png'; // ✅
import logo from '/logo.png';  // ⚠️ Absolute from public
```

### Environment Variables Not Working

**Problem**: `undefined` values in production

**Solutions**:

1. **Check build-time injection**:
```bash
# Environment variables must be prefixed with VITE_
VITE_SUPABASE_URL=...  # ✅ Injected at build time
API_KEY=...             # ❌ Not accessible
```

2. **Rebuild with correct env**:
```bash
# Use .env.production
npm run build

# Or inline
VITE_SUPABASE_URL=xxx npm run build
```

## Performance Issues

### Slow Initial Load

**Solutions**:

1. **Enable code splitting**:
```typescript
const Dashboard = lazy(() => import('@/features/dashboard'));
```

2. **Optimize images**:
```bash
# Use WebP format
# Compress images
# Use CDN
```

3. **Enable compression**:
```apache
# .htaccess
AddOutputFilterByType DEFLATE text/html text/css application/javascript
```

### Slow Database Queries

**Solutions**:

1. **Add indexes** (see Database Issues)

2. **Use caching**:
```typescript
const { data } = useQuery({
  queryKey: ['clients'],
  queryFn: fetchClients,
  staleTime: 5 * 60 * 1000, // Cache for 5 minutes
});
```

3. **Optimize RLS policies**:
```sql
-- Use indexed columns in policies
CREATE POLICY "view_clients"
  ON clients FOR SELECT
  USING (user_id = (SELECT auth.uid())); -- user_id is indexed
```

## Getting Help

If your issue isn't listed here:

1. **Search GitHub Issues**: [github.com/yourproject/issues](https://github.com/yourproject/issues)
2. **Check Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
3. **Ask in Discussions**: [github.com/yourproject/discussions](https://github.com/yourproject/discussions)
4. **Contact Support**: support@yourproject.com

### Creating a Bug Report

Include:

1. **Environment**:
   - OS and version
   - Node version: `node --version`
   - npm version: `npm --version`
   - Browser and version

2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Error messages** (full stack trace)
6. **Screenshots** (if applicable)

### Logs to Include

```bash
# Browser console logs
# (Open DevTools → Console → Right-click → Save as)

# Supabase logs
# (Dashboard → Logs → Filter by error)

# Build logs
npm run build 2>&1 | tee build.log

# Server logs (if applicable)
```

---

**Most issues can be solved with a fresh install and proper configuration. When in doubt, start from scratch.**
