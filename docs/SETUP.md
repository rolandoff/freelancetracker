# Environment Setup Guide

This guide will walk you through setting up the Freelancer Time Tracker development environment from scratch.

## Table of Contents

- [Prerequisites](#prerequisites)
- [System Requirements](#system-requirements)
- [Step-by-Step Setup](#step-by-step-setup)
- [Supabase Configuration](#supabase-configuration)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Development Tools](#development-tools)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

1. **Node.js** (v18.0.0 or higher)
   ```bash
   # Check version
   node --version

   # Install via nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   nvm use 18
   ```

2. **npm** (v9.0.0 or higher)
   ```bash
   # Check version
   npm --version

   # Update npm
   npm install -g npm@latest
   ```

3. **Git** (v2.30.0 or higher)
   ```bash
   # Check version
   git --version

   # Install on macOS
   brew install git

   # Install on Ubuntu/Debian
   sudo apt-get install git
   ```

4. **Code Editor** (VS Code recommended)
   - Download from [code.visualstudio.com](https://code.visualstudio.com/)

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "supabase.supabase-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

Save this as `.vscode/extensions.json` in your project.

## System Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Disk**: 2 GB free space
- **OS**: macOS 10.15+, Windows 10+, Ubuntu 20.04+

### Recommended Requirements
- **CPU**: 4+ cores
- **RAM**: 8+ GB
- **Disk**: 5+ GB free space
- **Internet**: Stable connection for Supabase

## Step-by-Step Setup

### 1. Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/yourusername/freelancer-time-tracker.git

# Or via SSH (if you have SSH keys set up)
git clone git@github.com:yourusername/freelancer-time-tracker.git

# Navigate to project directory
cd freelancer-time-tracker
```

### 2. Install Dependencies

```bash
# Install all npm packages
npm install

# This will install:
# - React, TypeScript, Vite
# - Supabase client
# - TanStack Query, Zustand
# - shadcn/ui components
# - All development dependencies
```

**Note**: This may take 2-5 minutes depending on your internet speed.

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Open in your editor
code .env.local
```

You'll need to fill in these values (see [Environment Variables](#environment-variables) section).

### 4. Set Up Supabase Project

See the [Supabase Configuration](#supabase-configuration) section below.

### 5. Initialize Database

```bash
# This will run all database migrations
npm run db:migrate

# Or manually apply the schema from docs/PRD-COMPLETE.md
```

### 6. Start Development Server

```bash
# Start Vite dev server
npm run dev

# Server will start at http://localhost:5173
```

## Supabase Configuration

### Create a Supabase Project

1. **Sign up** at [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: freelancer-time-tracker-dev
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is sufficient for development

4. Wait for project to be provisioned (2-3 minutes)

### Get Your Credentials

Once your project is ready:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbGc...` (long string)

3. Update `.env.local`:
   ```bash
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```

### Apply Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Open `/docs/PRD-COMPLETE.md` in your editor
3. Copy the entire SQL schema (lines 70-702)
4. Paste into SQL Editor and click **Run**
5. Verify tables were created in **Table Editor**

### Set Up Storage Buckets

1. Go to **Storage** in Supabase dashboard
2. Click **"New Bucket"**
3. Create two buckets:
   - **Name**: `activity-attachments`
   - **Public**: No
   - **File size limit**: 10 MB

   - **Name**: `invoice-pdfs`
   - **Public**: No
   - **File size limit**: 10 MB

4. Copy and run the storage policies from `PRD-COMPLETE.md` (lines 706-749)

## Environment Variables

### Complete `.env.local` Template

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Application Configuration
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME="Freelancer Time Tracker"

# Feature Flags (optional)
VITE_ENABLE_EMAIL=false
VITE_ENABLE_ANALYTICS=false

# Development Settings
VITE_LOG_LEVEL=debug
```

### Production Variables (`.env.production`)

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Application Configuration
VITE_APP_URL=https://app.yourdomain.com
VITE_APP_NAME="Freelancer Time Tracker"

# Feature Flags
VITE_ENABLE_EMAIL=true
VITE_ENABLE_ANALYTICS=true

# Production Settings
VITE_LOG_LEVEL=error
```

### Security Notes

- **Never commit** `.env.local` or `.env.production` to Git
- **Always use** `VITE_` prefix for client-side variables
- **Store secrets** in Supabase dashboard for server-side operations
- **Rotate keys** if accidentally exposed

## Database Setup

### Automated Setup (Recommended)

```bash
# Run all migrations
npm run db:migrate

# Seed database with sample data (optional)
npm run db:seed
```

### Manual Setup

1. Open Supabase SQL Editor
2. Run schema from `docs/PRD-COMPLETE.md`
3. Verify with:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

### Generate TypeScript Types

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-id

# Generate types
supabase gen types typescript --project-id your-project-id --schema public > src/types/database.types.ts
```

## Development Tools

### Install shadcn/ui Components

The project uses shadcn/ui for UI components. Install as needed:

```bash
# Initialize shadcn/ui (already done)
npx shadcn-ui@latest init

# Add components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
```

### Storybook Setup

```bash
# Start Storybook
npm run storybook

# Runs at http://localhost:6006

# Build Storybook
npm run build:storybook
```

### Development Database GUI

**Recommended**: Use Supabase Studio (built-in)
- Access via your Supabase project dashboard
- Full database browser and SQL editor

**Alternative**: Use TablePlus or DBeaver
```bash
# Connection details:
Host: db.your-project.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [your database password]
```

## Verification

### Check Installation

Run these commands to verify everything is set up correctly:

```bash
# 1. Check Node.js and npm
node --version  # Should be v18+
npm --version   # Should be v9+

# 2. Check TypeScript compilation
npm run typecheck
# Should output: "Found 0 errors"

# 3. Check linting
npm run lint
# Should complete without errors

# 4. Run tests
npm run test
# Should pass all tests

# 5. Build project
npm run build
# Should create dist/ folder
```

### Test Supabase Connection

Create a test file `src/lib/test-connection.ts`:

```typescript
import { supabase } from './supabase';

export async function testConnection() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Supabase connection failed:', error);
    return false;
  }

  console.log('Supabase connected successfully!');
  return true;
}
```

Run in browser console after starting dev server.

### Create Test User

1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:5173/register`
3. Create an account
4. Check Supabase **Authentication** tab for the user
5. Check **user_settings** table for auto-created settings

## Troubleshooting

### Port Already in Use

```bash
# If port 5173 is in use
npm run dev -- --port 3000

# Or kill process using port
lsof -ti:5173 | xargs kill
```

### Node Version Issues

```bash
# Use nvm to manage Node versions
nvm use 18

# Or update to latest LTS
nvm install --lts
nvm use --lts
```

### Supabase Connection Errors

1. **Check credentials**: Verify URL and anon key in `.env.local`
2. **Check RLS**: Ensure Row Level Security policies are created
3. **Check network**: Verify firewall/proxy settings
4. **Check project status**: Ensure project is not paused in Supabase

### Module Not Found Errors

```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### TypeScript Errors

```bash
# Regenerate types
npm run types:generate

# Check for type errors
npm run typecheck
```

### Build Errors

```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Rebuild
npm run build
```

## Next Steps

After completing setup:

1. **Read the PRD**: Understand the application architecture
2. **Explore the code**: Start with `src/main.tsx`
3. **Run Storybook**: See available components
4. **Check CONTRIBUTING.md**: Learn development workflow
5. **Pick an issue**: Start contributing!

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)

## Getting Help

If you encounter issues not covered here:

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Search [GitHub Issues](https://github.com/yourusername/freelancer-time-tracker/issues)
3. Ask in [GitHub Discussions](https://github.com/yourusername/freelancer-time-tracker/discussions)
4. Reach out to the maintainers

---

**Happy coding!**
