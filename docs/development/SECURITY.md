# Security Best Practices

Security guidelines and best practices for Freelancer Time Tracker.

## Table of Contents

- [Security Overview](#security-overview)
- [Authentication & Authorization](#authentication--authorization)
- [Row Level Security (RLS)](#row-level-security-rls)
- [Data Protection](#data-protection)
- [API Security](#api-security)
- [Client-Side Security](#client-side-security)
- [File Upload Security](#file-upload-security)
- [Environment Variables](#environment-variables)
- [Security Checklist](#security-checklist)
- [Incident Response](#incident-response)

## Security Overview

### Security Layers

```
┌─────────────────────────────────────┐
│   Client-Side (React)               │
│   - Input validation                │
│   - XSS prevention                  │
│   - CSRF protection                 │
└──────────────┬──────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────┐
│   Supabase Edge                     │
│   - Rate limiting                   │
│   - DDoS protection                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Row Level Security (RLS)          │
│   - User isolation                  │
│   - Permission checks               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   PostgreSQL                        │
│   - Encrypted at rest               │
│   - Audit logging                   │
└─────────────────────────────────────┘
```

### Threat Model

**Protected Against:**
- ✅ SQL Injection (via Supabase client)
- ✅ XSS (via React escaping)
- ✅ CSRF (via SameSite cookies)
- ✅ Unauthorized data access (via RLS)
- ✅ Brute force attacks (via rate limiting)

**Additional Considerations:**
- ⚠️ DDoS (mitigated by Supabase/hosting)
- ⚠️ Account enumeration (email validation timing)
- ⚠️ Session hijacking (use HTTPS only)

## Authentication & Authorization

### Supabase Auth Configuration

**Secure Configuration:**
```typescript
// lib/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Proof Key for Code Exchange
  },
});
```

### Password Policy

Enforce in Supabase dashboard:
- **Minimum length**: 8 characters
- **Complexity**: Require letters and numbers
- **Prevent common passwords**: Enable blocklist

**Additional client-side validation:**
```typescript
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character');
```

### Session Management

```typescript
// Automatic session refresh
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Session refreshed');
  }
  if (event === 'SIGNED_OUT') {
    // Clear sensitive data
    queryClient.clear();
    localStorage.clear();
  }
});

// Secure logout
const signOut = async () => {
  await supabase.auth.signOut();
  navigate('/login');
};
```

### Protected Routes

```typescript
// components/ProtectedRoute.tsx
export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
```

### Rate Limiting

Supabase provides built-in rate limiting:
- **Auth endpoints**: 30 requests/hour per IP
- **API endpoints**: Configurable per project

**Client-side debouncing:**
```typescript
// Prevent rapid successive requests
const debouncedSearch = useDebounce(searchTerm, 500);
```

## Row Level Security (RLS)

### RLS Principles

1. **Deny by default** - Enable RLS on all tables
2. **User isolation** - Use `auth.uid()` in policies
3. **Least privilege** - Grant minimum necessary access
4. **Performance** - Use `(SELECT auth.uid())` for better query plans

### Secure RLS Policies

**Correct Implementation:**
```sql
-- ✅ GOOD - Uses subquery for better performance
CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT
  USING (user_id = (SELECT auth.uid()));

-- ❌ BAD - Direct function call can cause performance issues
CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT
  USING (user_id = auth.uid());
```

### Testing RLS Policies

```sql
-- Test as specific user
SET request.jwt.claim.sub = 'user-uuid-here';

-- Try to access another user's data
SELECT * FROM clients WHERE user_id != 'user-uuid-here';
-- Should return 0 rows

-- Reset
RESET request.jwt.claim.sub;
```

### RLS Bypass Prevention

**Never use service role key client-side:**
```typescript
// ❌ NEVER DO THIS
const supabase = createClient(url, SERVICE_ROLE_KEY); // Bypasses RLS!

// ✅ ALWAYS USE ANON KEY
const supabase = createClient(url, ANON_KEY); // Respects RLS
```

## Data Protection

### Encryption

- **At rest**: Supabase encrypts all data with AES-256
- **In transit**: HTTPS/TLS 1.3 for all connections
- **Backups**: Encrypted backups

### Sensitive Data Handling

**Do NOT store in database:**
- Credit card numbers (use payment processor)
- Passwords (Supabase Auth handles this)
- Private keys/tokens

**If you must store sensitive data:**
```typescript
// Use Supabase Vault (enterprise feature)
// Or encrypt client-side before storage
import { encrypt, decrypt } from '@/lib/crypto';

const encrypted = await encrypt(sensitiveData, userKey);
await supabase.from('secrets').insert({ data: encrypted });
```

### PII (Personally Identifiable Information)

**Minimize collection:**
- Only collect what's necessary
- Mark PII fields clearly
- Implement data retention policies

**GDPR Compliance:**
```typescript
// Right to deletion
async function deleteUserData(userId: string) {
  // Cascade deletes handled by FK constraints
  await supabase.auth.admin.deleteUser(userId);
}

// Right to export
async function exportUserData(userId: string) {
  const { data } = await supabase
    .from('user_data_export_view')
    .select('*')
    .eq('user_id', userId)
    .single();

  return data;
}
```

## API Security

### Input Validation

**Always validate on both client and server:**

```typescript
// Client-side validation (UX)
const clientSchema = z.object({
  name: z.string().min(1).max(255),
  siret: z.string().regex(/^\d{14}$/),
  email: z.string().email(),
});

// Server-side validation (security)
// Supabase schema constraints:
ALTER TABLE clients ADD CONSTRAINT valid_siret
  CHECK (siret ~ '^\d{14}$');
```

### SQL Injection Prevention

**Supabase client prevents SQL injection:**
```typescript
// ✅ SAFE - Parameterized query
await supabase
  .from('clients')
  .select('*')
  .eq('name', userInput); // Automatically escaped

// ❌ NEVER use raw SQL with user input
// await supabase.rpc('raw_query', { sql: `SELECT * FROM clients WHERE name = '${userInput}'` });
```

### CORS Configuration

Configure in Supabase dashboard:
```
Allowed origins:
- https://app.yourdomain.com
- https://yourdomain.com

Do NOT use: *
```

## Client-Side Security

### XSS Prevention

React provides automatic XSS protection:
```typescript
// ✅ SAFE - React escapes by default
<div>{userInput}</div>

// ⚠️ DANGEROUS - Only use with trusted content
<div dangerouslySetInnerHTML={{ __html: trustedHTML }} />
```

**When using dangerouslySetInnerHTML:**
```typescript
import DOMPurify from 'dompurify';

const SafeHTML = ({ html }: { html: string }) => {
  const sanitized = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};
```

### Content Security Policy (CSP)

Add to `.htaccess`:
```apache
Header set Content-Security-Policy "\
  default-src 'self'; \
  script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; \
  style-src 'self' 'unsafe-inline'; \
  img-src 'self' data: https:; \
  font-src 'self' data:; \
  connect-src 'self' https://*.supabase.co; \
  frame-ancestors 'none';\
"
```

### Local Storage Security

**Never store sensitive data in localStorage:**
```typescript
// ❌ BAD
localStorage.setItem('password', password);
localStorage.setItem('api_key', apiKey);

// ✅ GOOD - Only non-sensitive preferences
localStorage.setItem('theme', 'dark');
localStorage.setItem('language', 'fr');

// Supabase automatically stores session tokens securely
```

## File Upload Security

### File Type Validation

**Client-side:**
```typescript
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function validateFileType(file: File): boolean {
  return ALLOWED_TYPES.includes(file.type);
}
```

**Server-side (Storage policy):**
```sql
CREATE POLICY "Only allow specific file types"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'activity-attachments'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
  )
  AND (
    lower(split_part(name, '.', -1)) IN ('jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx')
  )
);
```

### File Size Limits

```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}
```

### Secure File Naming

```typescript
// Prevent path traversal
function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Remove special chars
    .replace(/\.{2,}/g, '.') // Prevent ../
    .substring(0, 255); // Limit length
}

// Use UUID for unique names
const secureFileName = `${userId}/${activityId}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
```

### Virus Scanning

For production, consider integrating:
- **ClamAV** - Open-source antivirus
- **VirusTotal API** - Cloud-based scanning
- **AWS GuardDuty** - If using AWS

## Environment Variables

### Secure Management

**Never commit secrets:**
```bash
# .gitignore
.env
.env.local
.env.production
.env.*.local
```

**Client-side variables:**
```bash
# ✅ SAFE - Prefixed with VITE_, will be bundled
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...

# ❌ DANGEROUS - Never expose
SUPABASE_SERVICE_ROLE_KEY=xxx  # Server-side only!
DATABASE_PASSWORD=xxx           # Server-side only!
```

### Environment Separation

```
Development:  .env.local
Staging:      .env.staging
Production:   .env.production
```

### Secret Rotation

**Regularly rotate:**
- Supabase anon key (if compromised)
- Service role key (quarterly)
- Database passwords (quarterly)

**In Supabase dashboard:**
Settings → API → Generate new key → Update apps → Revoke old key

## Security Checklist

### Pre-Launch

- [ ] All tables have RLS enabled
- [ ] RLS policies tested for all tables
- [ ] No service role key in client code
- [ ] Environment variables properly configured
- [ ] HTTPS enforced (no HTTP)
- [ ] CORS configured (no wildcard *)
- [ ] CSP headers configured
- [ ] File upload validation (type, size)
- [ ] Password policy enforced
- [ ] Rate limiting configured
- [ ] Error messages don't leak sensitive info
- [ ] Audit logging enabled
- [ ] Backup strategy in place

### Ongoing

- [ ] Monitor Supabase logs weekly
- [ ] Review RLS policies quarterly
- [ ] Update dependencies monthly
- [ ] Rotate secrets quarterly
- [ ] Conduct security audit annually
- [ ] Train team on security best practices

## Incident Response

### Security Incident Procedure

1. **Detect**
   - Monitor Supabase logs
   - Set up alerts for suspicious activity
   - User reports

2. **Respond**
   - Isolate affected systems
   - Revoke compromised credentials
   - Document incident

3. **Recover**
   - Restore from backup if needed
   - Apply security patches
   - Update policies

4. **Learn**
   - Post-mortem analysis
   - Update procedures
   - Prevent recurrence

### Reporting Vulnerabilities

If you discover a security vulnerability:

1. **Do NOT** create a public GitHub issue
2. **Email**: security@yourproject.com
3. **Include**:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (optional)

4. **Response time**: Within 48 hours
5. **Disclosure**: Coordinated disclosure after fix

### Emergency Contacts

- **Supabase Support**: support@supabase.io
- **Security Team**: security@yourproject.com
- **On-call**: [Phone number]

## Security Resources

### Documentation

- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security](https://react.dev/reference/react-dom/server#security-caveats)
- [GDPR Compliance](https://gdpr.eu/)

### Tools

- **Dependency scanning**: `npm audit`
- **SAST**: Snyk, SonarQube
- **Penetration testing**: OWASP ZAP
- **Secret scanning**: GitGuardian, TruffleHog

### Training

- [OWASP WebGoat](https://owasp.org/www-project-webgoat/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)

---

**Security is everyone's responsibility. Stay vigilant.**
