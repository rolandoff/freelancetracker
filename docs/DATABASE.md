# Database Schema and Migration Guide

Complete guide for database schema management, migrations, and Supabase configuration.

## Table of Contents

- [Schema Overview](#schema-overview)
- [Initial Setup](#initial-setup)
- [Table Details](#table-details)
- [Row Level Security (RLS)](#row-level-security-rls)
- [Storage Configuration](#storage-configuration)
- [Migrations](#migrations)
- [Backup and Restore](#backup-and-restore)
- [Performance Optimization](#performance-optimization)

## Schema Overview

### Entity Relationship Diagram

```
USER (auth.users)
  ├── user_settings (1:1)
  ├── clients (1:N)
  ├── projects (1:N)
  ├── rates (1:N)
  ├── activities (1:N)
  ├── time_entries (1:N)
  └── invoices (1:N)

CLIENT
  ├── projects (1:N)
  ├── rates (1:N - specific rates)
  ├── activities (1:N)
  └── invoices (1:N)

PROJECT
  └── activities (1:N)

ACTIVITY
  ├── time_entries (1:N)
  ├── attachments (1:N)
  └── invoice_items (1:1 - optional)

INVOICE
  └── invoice_items (1:N)
```

### Tables Summary

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `user_settings` | User configuration | SIRET, fiscal settings, theme |
| `clients` | Client management | SIRET validation, soft delete |
| `projects` | Project organization | Color coding, archiving |
| `rates` | Pricing configuration | Base + client-specific rates |
| `activities` | Task workflow | 6-state Kanban, time tracking |
| `time_entries` | Time tracking | Auto-duration calculation |
| `activity_attachments` | File management | Supabase Storage integration |
| `invoices` | Invoice generation | Auto-numbering, PDF storage |
| `invoice_items` | Invoice line items | Activity or manual entries |

## Initial Setup

### Step 1: Create Supabase Project

```bash
# Using Supabase CLI
supabase init
supabase login
supabase link --project-ref your-project-id

# Or create via dashboard at supabase.com
```

### Step 2: Apply Complete Schema

The complete schema is in [PRD-COMPLETE.md](./PRD-COMPLETE.md), lines 70-702.

**Via Supabase Dashboard:**
1. Go to SQL Editor
2. Copy entire schema from PRD-COMPLETE.md
3. Paste and click "Run"

**Via CLI:**
```bash
# Create migration file
supabase migration new initial_schema

# Add schema to the migration file
# Then apply:
supabase db push
```

### Step 3: Verify Installation

```sql
-- Check tables
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

## Table Details

### user_settings

Stores user/freelancer configuration.

```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Company information
  company_name VARCHAR(255),
  siret VARCHAR(14) UNIQUE,
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(10),
  country VARCHAR(2) DEFAULT 'FR',

  -- Fiscal configuration
  tva_applicable BOOLEAN DEFAULT FALSE,
  taux_cotisations DECIMAL(5,2) DEFAULT 24.60,
  plafond_ca_annuel DECIMAL(10,2) DEFAULT 77700.00,

  -- UI preferences
  theme VARCHAR(10) DEFAULT 'light',
  language VARCHAR(5) DEFAULT 'fr',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);
```

**Key Constraints:**
- One setting per user (enforced by UNIQUE)
- SIRET must be globally unique
- Cascades on user deletion

### clients

Client management with French business requirements.

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),

  -- French business identifiers
  siret VARCHAR(14),
  tva_intracommunautaire VARCHAR(20),

  -- Address
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(10),
  country VARCHAR(2) DEFAULT 'FR',

  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_client_siret UNIQUE(user_id, siret)
);

CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_active ON clients(user_id, is_active);
```

**Validation Rules:**
- SIRET: 14 digits (validated in application)
- Unique SIRET per user (can have duplicates across users)
- Soft delete via `is_active` flag

### activities

Core workflow table with 6-state Kanban.

```sql
CREATE TYPE activity_status AS ENUM (
  'por_validar',
  'en_curso',
  'en_prueba',
  'completada',
  'por_facturar',
  'facturada'
);

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  description TEXT,

  service_type service_type NOT NULL,
  hourly_rate DECIMAL(10,2),
  estimated_hours DECIMAL(10,2),

  status activity_status DEFAULT 'por_validar',
  sort_order INTEGER DEFAULT 0,

  observations TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  invoiced_at TIMESTAMPTZ
);
```

**State Transitions:**
```
por_validar → en_curso → en_prueba → completada → por_facturar → facturada
            ↑         ↓   ↓        ↑
            └─────────┴───┴────────┘
            (rollbacks allowed)
```

### invoices

Invoice management with auto-numbering.

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  invoice_number VARCHAR(50) UNIQUE NOT NULL,

  invoice_date DATE NOT NULL,
  due_date DATE,
  paid_date DATE,

  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,

  status invoice_status DEFAULT 'borrador',

  notes TEXT,
  payment_terms TEXT,
  pdf_path TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Auto-numbering Trigger:**
```sql
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  year_prefix VARCHAR(4);
  next_number INTEGER;
  new_invoice_number VARCHAR(50);
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    year_prefix := TO_CHAR(NEW.invoice_date, 'YYYY');

    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 6) AS INTEGER)), 0) + 1
    INTO next_number
    FROM invoices
    WHERE user_id = NEW.user_id
      AND invoice_number LIKE year_prefix || '-%';

    new_invoice_number := year_prefix || '-' || LPAD(next_number::TEXT, 4, '0');
    NEW.invoice_number := new_invoice_number;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_invoice_number_trigger
  BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();
```

Format: `YYYY-NNNN` (e.g., `2025-0001`)

## Row Level Security (RLS)

### Why RLS?

- **Security**: Users can only access their own data
- **Performance**: Queries automatically filtered
- **Simplicity**: No middleware required

### RLS Policies

All tables use the same pattern:

```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- SELECT policy
CREATE POLICY "Users can view their own records"
  ON table_name FOR SELECT
  USING (user_id = (SELECT auth.uid()));

-- INSERT policy
CREATE POLICY "Users can insert their own records"
  ON table_name FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

-- UPDATE policy
CREATE POLICY "Users can update their own records"
  ON table_name FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

-- DELETE policy
CREATE POLICY "Users can delete their own records"
  ON table_name FOR DELETE
  USING (user_id = (SELECT auth.uid()));
```

**Important**: Always use `(SELECT auth.uid())` instead of `auth.uid()` for better performance.

### Special Case: invoice_items

Invoice items use a subquery since they don't have `user_id`:

```sql
CREATE POLICY "Users can view items from their own invoices"
  ON invoice_items FOR SELECT
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE user_id = (SELECT auth.uid())
    )
  );
```

### Testing RLS

```sql
-- As specific user
SET request.jwt.claim.sub = 'user-uuid-here';

-- Try to access data
SELECT * FROM clients;

-- Should only return that user's clients
```

## Storage Configuration

### Buckets

Two storage buckets required:

1. **activity-attachments** - For activity files
2. **invoice-pdfs** - For generated invoices

### Create Buckets

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('activity-attachments', 'activity-attachments', false),
  ('invoice-pdfs', 'invoice-pdfs', false);
```

### Storage Policies

```sql
-- activity-attachments policies
CREATE POLICY "Users can upload their own activity attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'activity-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own activity attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'activity-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own activity attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'activity-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### File Naming Convention

```
{bucket_id}/{user_id}/{resource_id}/{filename}

Examples:
activity-attachments/abc123/activity-xyz/screenshot.png
invoice-pdfs/abc123/invoice-789/2025-0001.pdf
```

## Migrations

### Creating Migrations

```bash
# Using Supabase CLI
supabase migration new migration_name

# Creates: supabase/migrations/YYYYMMDDHHMMSS_migration_name.sql
```

### Example Migration: Add Field

```sql
-- supabase/migrations/20250101000000_add_client_website.sql
ALTER TABLE clients
ADD COLUMN website VARCHAR(255);

-- Add index if needed
CREATE INDEX idx_clients_website ON clients(website);
```

### Example Migration: Modify Enum

```sql
-- Add new service type
ALTER TYPE service_type ADD VALUE 'formation';

-- Note: Cannot remove enum values easily
-- Need to recreate enum if removal needed
```

### Applying Migrations

```bash
# Local development
supabase db reset  # Resets and applies all migrations

# Production
supabase db push   # Applies pending migrations
```

### Migration Best Practices

1. **Always test locally first**
2. **Make migrations reversible when possible**
3. **Use transactions for complex changes**
4. **Document breaking changes**
5. **Keep migrations small and focused**

### Rollback Example

```sql
-- supabase/migrations/20250101000000_add_client_website.sql
-- Forward migration
ALTER TABLE clients ADD COLUMN website VARCHAR(255);

-- Rollback (in separate file if needed)
-- supabase/migrations/20250101000001_rollback_client_website.sql
ALTER TABLE clients DROP COLUMN website;
```

## Backup and Restore

### Manual Backup

```bash
# Via Supabase CLI
supabase db dump -f backup.sql

# Or via pg_dump
pg_dump -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f backup.dump
```

### Automated Backups

Supabase provides:
- **Daily backups** (retained for 7 days on free tier)
- **Point-in-time recovery** (paid plans)

Access via: Project Settings → Database → Backups

### Restore from Backup

```bash
# Via Supabase
# 1. Go to Backups in dashboard
# 2. Select backup
# 3. Click "Restore"

# Or via pg_restore
pg_restore -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  backup.dump
```

## Performance Optimization

### Indexes

Already created in schema:

```sql
-- Client indexes
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_active ON clients(user_id, is_active);

-- Activity indexes
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_project_id ON activities(project_id);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_client_id ON activities(client_id);

-- Time entry indexes
CREATE INDEX idx_time_entries_activity_id ON time_entries(activity_id);
CREATE INDEX idx_time_entries_date ON time_entries(start_time);

-- Invoice indexes
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(invoice_date DESC);
```

### Query Optimization Tips

1. **Use SELECT specific columns** instead of `SELECT *`
2. **Filter early** with WHERE clauses
3. **Use indexes** for commonly filtered columns
4. **Limit results** with LIMIT clause
5. **Avoid N+1 queries** - use JOINs or Supabase's nested SELECT

Example:
```typescript
// Good - Single query with JOIN
const { data } = await supabase
  .from('activities')
  .select(`
    *,
    client:clients(name, email),
    project:projects(name, color)
  `)
  .eq('user_id', userId);

// Bad - N+1 queries
const { data: activities } = await supabase
  .from('activities')
  .select('*')
  .eq('user_id', userId);

for (const activity of activities) {
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', activity.client_id)
    .single();
  // ...
}
```

### Monitoring

Check query performance:

```sql
-- Enable query stats
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Vacuum and Analyze

Supabase handles this automatically, but you can manually trigger:

```sql
VACUUM ANALYZE;
```

## Useful Queries

### Data Integrity Checks

```sql
-- Find orphaned activities (shouldn't exist with CASCADE)
SELECT a.* FROM activities a
LEFT JOIN clients c ON a.client_id = c.id
WHERE c.id IS NULL;

-- Find invoices without items
SELECT i.* FROM invoices i
LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
WHERE ii.id IS NULL AND i.status != 'borrador';

-- Check RLS coverage
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;
```

### Analytics Queries

```sql
-- Monthly revenue by client
SELECT
  c.name as client,
  DATE_TRUNC('month', i.invoice_date) as month,
  SUM(i.total) as revenue
FROM invoices i
JOIN clients c ON i.client_id = c.id
WHERE i.status = 'pagada'
GROUP BY c.name, DATE_TRUNC('month', i.invoice_date)
ORDER BY month DESC, revenue DESC;

-- Top activities by time spent
SELECT
  a.title,
  c.name as client,
  SUM(te.duration_minutes) / 60.0 as hours_worked,
  COUNT(te.id) as time_entries
FROM activities a
JOIN clients c ON a.client_id = c.id
LEFT JOIN time_entries te ON a.id = te.activity_id
GROUP BY a.id, a.title, c.name
ORDER BY hours_worked DESC
LIMIT 10;
```

## Additional Resources

- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Documentation](https://supabase.com/docs/guides/storage)

---

**Database schema maintained and secured by RLS**
