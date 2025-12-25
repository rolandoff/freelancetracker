# Supabase Setup Guide

Complete guide to set up Supabase for the Freelancer Time Tracker application.

---

## Step 1: Create Supabase Project

### Option A: Via Supabase Dashboard (Recommended for beginners)

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - **Project Name**: `freelancer-time-tracker` (or your choice)
   - **Database Password**: Create a strong password (save it securely!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is fine for development
5. Click "Create new project"
6. Wait 2-3 minutes for project to be provisioned

### Option B: Via Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize project
supabase init

# Link to your project
supabase link --project-ref your-project-ref
```

---

## Step 2: Get Your Project Credentials

1. In Supabase Dashboard, go to **Project Settings** (gear icon bottom left)
2. Click **API** in the sidebar
3. Copy and save these values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (very long string)

---

## Step 3: Configure Environment Variables

1. In your project root, create a `.env.local` file:

```bash
cp .env.example .env.local
```

2. Open `.env.local` and add your credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:**
- Never commit `.env.local` to git (it's already in .gitignore)
- Keep your anon key secure (it's safe for client-side use)

---

## Step 4: Deploy Database Schema

### Option A: Via Supabase Dashboard SQL Editor (Easiest)

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open `supabase/migrations/20250101000000_initial_schema.sql` from this project
4. Copy all contents
5. Paste into SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Wait for "Success. No rows returned"
8. Repeat for `supabase/migrations/20250101000001_storage_setup.sql`

### Option B: Via Supabase CLI

```bash
# Make sure you're in the project root
cd /path/to/freelancetracker

# Push migrations to Supabase
supabase db push

# This will apply all files in supabase/migrations/
```

---

## Step 5: Verify Installation

Run these verification queries in SQL Editor:

### 1. Check Tables

```sql
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected output:** 9 tables
- activity_attachments
- activities
- clients
- invoice_items
- invoices
- projects
- rates
- time_entries
- user_settings

### 2. Check RLS is Enabled

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

**Expected:** All tables should have `rowsecurity = true`

### 3. Check RLS Policies

```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected:** Should see policies for all tables (SELECT, INSERT, UPDATE, DELETE)

### 4. Check Storage Buckets

```sql
SELECT id, name, public
FROM storage.buckets;
```

**Expected output:**
- activity-attachments (public = false)
- invoice-pdfs (public = false)

### 5. Check Enums

```sql
SELECT
  t.typname AS enum_name,
  string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) AS enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('activity_status', 'invoice_status', 'service_type')
GROUP BY t.typname;
```

**Expected output:**
- `activity_status`: por_validar, en_curso, en_prueba, completada, por_facturar, facturada
- `invoice_status`: borrador, en_espera_pago, pagada, anulada
- `service_type`: programacion, consultoria, diseno, reunion, soporte, otro

---

## Step 6: Configure Authentication

Supabase Auth is enabled by default. Configure settings if needed:

1. Go to **Authentication** > **Providers**
2. **Email** provider is already enabled
3. Optional: Configure email templates
   - **Settings** > **Auth** > **Email Templates**
   - Customize confirmation, reset password emails

### Email Settings (Production)

For production, configure SMTP:

1. Go to **Project Settings** > **Auth**
2. Scroll to **SMTP Settings**
3. Enter your SMTP credentials (e.g., SendGrid, AWS SES, Mailgun)

---

## Step 7: Test the Connection

Run the dev server to test:

```bash
npm run dev
```

Open browser to `http://localhost:3000`

You should see the app load without errors. Check browser console for any Supabase connection issues.

---

## Common Issues & Troubleshooting

### Issue: "Invalid API key"

**Solution:**
- Verify your `.env.local` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after changing `.env.local`

### Issue: "relation 'public.clients' does not exist"

**Solution:**
- You haven't run the migrations yet
- Go back to Step 4 and deploy the schema

### Issue: "new row violates row-level security policy"

**Solution:**
- RLS policies require authentication
- Make sure user is logged in before accessing data
- Check that `auth.uid()` matches `user_id` in queries

### Issue: Storage upload fails

**Solution:**
- Verify storage buckets exist: `SELECT * FROM storage.buckets;`
- Check storage policies are created
- Ensure file path follows pattern: `{bucket_id}/{user_id}/{resource_id}/{filename}`

### Issue: Invoice number not auto-generating

**Solution:**
- Check trigger exists: `SELECT tgname FROM pg_trigger WHERE tgname = 'generate_invoice_number_trigger';`
- If missing, re-run migration `20250101000000_initial_schema.sql`

---

## Next Steps

Once Supabase is set up:

1. ✅ Project initialized with Vite + React + TypeScript
2. ✅ Supabase configured and database deployed
3. ⏭️ **Next:** Create shared infrastructure (utils, hooks, stores)

See `IMPLEMENTATION-PLAN.md` for detailed task breakdown.

---

## Useful Supabase Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

---

## Backup and Restore

### Create Backup

```bash
# Via Supabase Dashboard
# Go to: Database > Backups > Download

# Or via CLI
supabase db dump -f backup_$(date +%Y%m%d).sql
```

### Restore Backup

```bash
# Via Supabase Dashboard
# Go to: Database > Backups > Select backup > Restore

# Or via CLI
supabase db reset
supabase db push
```

---

**Database is now ready for development!** 🎉
