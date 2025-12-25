# Implementation Plan - Freelancer Time Tracker

**Start Date**: TBD
**Target Completion**: 5 weeks
**Confidence Score**: 8/10

## Table of Contents
- [Overview](#overview)
- [Phase Breakdown](#phase-breakdown)
- [Detailed Task List](#detailed-task-list)
- [Getting Started](#getting-started)
- [Day-by-Day Plan](#day-by-day-plan)
- [Success Metrics](#success-metrics)

## Overview

This plan implements a full-stack time-tracking and invoicing platform for French freelancers. The application uses React + TypeScript + Supabase with a focus on:

- **6-state Kanban workflow** for activity management
- **Automated time tracking** with manual entry support
- **French-compliant invoicing** with PDF generation
- **URSSAF calculations** and revenue monitoring
- **Real-time collaboration** via Supabase Realtime

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, shadcn/ui, TanStack Query, Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Special Features**: @dnd-kit (drag/drop), @react-pdf/renderer (PDFs), Recharts (dashboard)

## Phase Breakdown

### 📦 Phase 1: Foundation & Core CRUD (Weeks 1-2)

**Goal**: Get basic app running with authentication and core data management

**Deliverables**:
- ✅ Project scaffolding with Vite + React + TypeScript
- ✅ Supabase database schema deployed
- ✅ Authentication (login/register/forgot password)
- ✅ User settings with SIRET validation
- ✅ Clients CRUD with validation
- ✅ Projects CRUD with color coding
- ✅ Rates management (base + client-specific)
- ✅ Basic activities (create, list, edit)

**Validation**:
```bash
npm run lint && npm run typecheck && npm run build
```

### 🎨 Phase 2: Advanced Features (Weeks 3-4)

**Goal**: Implement Kanban, time tracking, and invoicing

**Deliverables**:
- ✅ Kanban board with drag & drop
- ✅ Real-time updates across users
- ✅ Automatic timer widget in sidebar
- ✅ Manual time entry
- ✅ File attachments (upload to Supabase Storage)
- ✅ Invoice creation flow
- ✅ PDF generation with French legal mentions
- ✅ Invoice status management

**Validation**:
- Kanban drag/drop works smoothly
- Timer creates time_entries in database
- PDFs download with correct legal text
- All state transitions validated

### 🚀 Phase 3: Polish & Deploy (Week 5)

**Goal**: Dashboard, monitoring, and production deployment

**Deliverables**:
- ✅ URSSAF dashboard with CA tracking
- ✅ Revenue charts (Recharts)
- ✅ TVA and plafond alerts
- ✅ Client reports
- ✅ Dark/light mode fully working
- ✅ Storybook documentation
- ✅ Unit tests for critical functions
- ✅ Production deployment to LWS

**Validation**:
```bash
npm run test
npm run build:storybook
./deploy.sh
```

---

## Detailed Task List

### Task 1: Project Scaffolding ⏱️ 2-3 hours

**Create base project structure**

```bash
# 1. Create Vite project
npm create vite@latest freelancer-time-tracker -- --template react-ts
cd freelancer-time-tracker

# 2. Install core dependencies
npm install @supabase/supabase-js @tanstack/react-query zustand
npm install react-router-dom react-hook-form zod @hookform/resolvers
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install @react-pdf/renderer recharts lucide-react date-fns
npm install react-day-picker

# 3. Install shadcn/ui
npx shadcn-ui@latest init

# Install needed components
npx shadcn-ui@latest add button card input label select dialog
npx shadcn-ui@latest add dropdown-menu form table tabs calendar

# 4. Install dev dependencies
npm install -D @types/node
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
npm install -D eslint prettier tailwindcss postcss autoprefixer
```

**Configure files**:
- Copy `tsconfig.json` from `docs/EJEMPLOS-CODIGO.md`
- Copy `tailwind.config.js` from examples
- Set up ESLint and Prettier
- Create `.env.local` from `.env.example`

**Deliverable**: App runs with `npm run dev` ✅

---

### Task 2: Supabase Setup ⏱️ 3-4 hours

**Create and configure Supabase project**

1. **Create project** at supabase.com
   - Name: `freelancer-time-tracker-dev`
   - Region: Closest to you
   - Note credentials

2. **Apply database schema**:
   - Open SQL Editor in Supabase dashboard
   - Copy complete schema from `docs/PRD-COMPLETE.md` (lines 70-702)
   - Run all SQL
   - Verify tables created

3. **Create Storage buckets**:
   ```sql
   -- Run in SQL Editor
   INSERT INTO storage.buckets (id, name, public)
   VALUES
     ('activity-attachments', 'activity-attachments', false),
     ('invoice-pdfs', 'invoice-pdfs', false);
   ```

4. **Apply storage policies**:
   - Copy from `docs/PRD-COMPLETE.md` (lines 706-749)
   - Run in SQL Editor

5. **Generate TypeScript types**:
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
   ```

6. **Save schema**:
   ```bash
   mkdir supabase
   # Copy schema SQL to supabase/schema.sql
   ```

**Deliverable**: Database ready with RLS enabled ✅

---

### Task 3: Shared Infrastructure ⏱️ 4-5 hours

**Create reusable components and utilities**

**Files to create**:

1. **`src/lib/supabase.ts`**
   - Copy from `docs/EJEMPLOS-CODIGO.md`
   - Configure with environment variables

2. **`src/lib/utils.ts`**
   - Helper functions (formatCurrency, validateSIRET, etc.)

3. **`src/lib/constants.ts`**
   - SERVICE_TYPES, ACTIVITY_STATUSES, INVOICE_STATUSES
   - URSSAF constants (rates, thresholds)

4. **`src/lib/validations.ts`**
   - Zod schemas for all forms
   - Copy examples from `docs/EJEMPLOS-CODIGO.md`

5. **`src/providers/ThemeProvider.tsx`**
   - Dark/light mode provider
   - Uses Zustand theme store

6. **`src/stores/uiStore.ts`**
   - Theme, sidebar state
   - Copy from examples

7. **`src/stores/timerStore.ts`**
   - Active timer management
   - Start/stop/clear functions

8. **`src/components/layout/AppLayout.tsx`**
   - Main layout with sidebar and header
   - Outlet for nested routes

9. **`src/components/layout/Sidebar.tsx`**
   - Navigation menu
   - Timer widget placeholder

10. **`src/components/layout/Header.tsx`**
    - User menu, theme toggle
    - Logout button

**Deliverable**: Base layout renders ✅

---

### Task 4: Authentication & Settings ⏱️ 6-8 hours

**Implement auth flows and user settings**

**Create**:

1. **Hooks**:
   - `src/hooks/useAuth.ts` - Auth state management
   - `src/features/auth/hooks/useSession.ts`

2. **Pages**:
   - `src/features/auth/pages/LoginPage.tsx`
   - `src/features/auth/pages/RegisterPage.tsx`
   - `src/features/auth/pages/ForgotPasswordPage.tsx`
   - `src/features/settings/pages/SettingsPage.tsx`

3. **Components**:
   - `src/features/auth/components/LoginForm.tsx`
   - `src/features/auth/components/RegisterForm.tsx`
   - `src/features/settings/components/CompanyInfoForm.tsx`
   - `src/features/settings/components/FiscalSettingsForm.tsx`

4. **Router** (`src/App.tsx`):
   ```typescript
   <Routes>
     <Route path="/login" element={<LoginPage />} />
     <Route path="/register" element={<RegisterPage />} />
     <Route element={<ProtectedRoute />}>
       <Route element={<AppLayout />}>
         <Route path="/dashboard" element={<DashboardPage />} />
         {/* More routes */}
       </Route>
     </Route>
   </Routes>
   ```

**Test**:
- Register new user
- Login works
- Session persists on refresh
- Logout clears session
- User settings save correctly

**Deliverable**: Full auth flow working ✅

---

### Task 5: Clients & Projects ⏱️ 6-8 hours

**CRUD operations for clients and projects**

**Create**:

1. **Clients**:
   - `src/features/clients/hooks/useClients.ts`
   - `src/features/clients/hooks/useClient.ts`
   - `src/features/clients/components/ClientForm.tsx`
   - `src/features/clients/components/ClientsTable.tsx`
   - `src/features/clients/components/ClientCard.tsx`
   - `src/features/clients/pages/ClientsPage.tsx`
   - `src/features/clients/pages/ClientDetailPage.tsx`

2. **Projects**:
   - `src/features/projects/hooks/useProjects.ts`
   - `src/features/projects/components/ProjectForm.tsx`
   - `src/features/projects/components/ProjectsTable.tsx`
   - `src/features/projects/pages/ProjectsPage.tsx`

**Features**:
- ✅ Create/Edit/Delete clients
- ✅ SIRET validation (14 digits)
- ✅ Soft delete (is_active flag)
- ✅ Client detail page shows related projects/activities/invoices
- ✅ Projects linked to clients
- ✅ Color picker for projects
- ✅ Archive/restore projects

**Deliverable**: Clients and Projects fully functional ✅

---

### Task 6: Rates Management ⏱️ 4-5 hours

**Configure pricing for services**

**Create**:
- `src/features/rates/hooks/useRates.ts`
- `src/features/rates/components/RateForm.tsx`
- `src/features/rates/components/RatesTable.tsx`
- `src/features/rates/components/ServiceTypeSelector.tsx`
- `src/features/rates/pages/RatesPage.tsx`

**Features**:
- ✅ Base rates (no client_id)
- ✅ Client-specific rates
- ✅ Service type selector
- ✅ Uniqueness constraint: (user_id, service_type, client_id)
- ✅ Active/inactive toggle

**Logic**:
```typescript
// When creating activity, fetch rate:
// 1. Try specific rate (client + service_type)
// 2. Fall back to base rate (service_type only)
// 3. If none, user enters manually
```

**Deliverable**: Rates system working ✅

---

### Task 7: Kanban Board & Activities ⏱️ 10-12 hours

**Complex drag/drop workflow system**

**Create**:

1. **Core Components**:
   - `src/features/activities/components/KanbanBoard.tsx`
   - `src/features/activities/components/KanbanColumn.tsx`
   - `src/features/activities/components/ActivityCard.tsx`
   - `src/features/activities/components/ActivityForm.tsx`
   - `src/features/activities/components/ActivityDetailModal.tsx`

2. **Attachments**:
   - `src/features/activities/components/FileUploader.tsx`
   - `src/features/activities/components/AttachmentsList.tsx`

3. **Hooks**:
   - `src/features/activities/hooks/useActivities.ts`
   - `src/features/activities/hooks/useActivity.ts`
   - `src/features/activities/hooks/useKanbanRealtime.ts`
   - `src/features/activities/hooks/useActivityAttachments.ts`

4. **Pages**:
   - `src/features/activities/pages/KanbanPage.tsx`

**Features**:
- ✅ 6 columns: por_validar → en_curso → en_prueba → completada → por_facturar → facturada
- ✅ Drag & drop with @dnd-kit
- ✅ State transition validation
- ✅ Real-time updates (Supabase Realtime)
- ✅ Filters (client, project, status)
- ✅ File uploads (max 10MB)
- ✅ File type validation
- ✅ Preview/download attachments

**Reference**: https://blog.logrocket.com/build-kanban-board-dnd-kit-react/

**Deliverable**: Full Kanban workflow ✅

---

### Task 8: Time Tracking ⏱️ 6-8 hours

**Timer widget and manual time entry**

**Create**:

1. **Components**:
   - `src/features/activities/components/TimeTracker.tsx` - Global widget
   - `src/features/activities/components/TimeEntryForm.tsx` - Manual entry
   - `src/features/activities/components/TimeEntriesList.tsx` - List per activity
   - `src/features/activities/components/ActivityTimeStats.tsx` - Summary

2. **Hooks**:
   - `src/features/activities/hooks/useTimeEntries.ts`

3. **Store**:
   - Update `src/stores/timerStore.ts` (from Task 3)

**Features**:
- ✅ Start/pause/stop timer
- ✅ Timer visible in sidebar
- ✅ Persist to time_entries table
- ✅ Duration auto-calculated by trigger
- ✅ Manual entry form
- ✅ Edit/delete time entries
- ✅ Display total hours per activity

**Deliverable**: Time tracking fully working ✅

---

### Task 9: Invoicing & PDF ⏱️ 10-12 hours

**French-compliant invoice generation**

**Create**:

1. **Components**:
   - `src/features/invoices/components/InvoiceForm.tsx`
   - `src/features/invoices/components/InvoiceItemsTable.tsx`
   - `src/features/invoices/components/InvoicePDF.tsx` - PDF template
   - `src/features/invoices/components/InvoicePreview.tsx`

2. **Hooks**:
   - `src/features/invoices/hooks/useInvoices.ts`
   - `src/features/invoices/hooks/useInvoice.ts`

3. **Pages**:
   - `src/features/invoices/pages/InvoicesPage.tsx`
   - `src/features/invoices/pages/InvoiceDetailPage.tsx`
   - `src/features/invoices/pages/InvoiceCreatePage.tsx`

**Features**:
- ✅ Select activities in "por_facturar" status
- ✅ Auto-calculate totals (hours × rate)
- ✅ Add manual items
- ✅ Apply discount (% or fixed amount)
- ✅ Invoice states: borrador → en_espera_pago → pagada/anulada
- ✅ Auto-numbering (YYYY-NNNN format)
- ✅ PDF with legal mentions:
  - SIRET freelancer & client
  - Article 293 B CGI
  - Payment terms
  - Late penalties mention
- ✅ Upload PDF to Supabase Storage
- ✅ Download PDF
- ✅ Mark as paid (updates activities to "facturada")

**Deliverable**: Complete invoicing system ✅

---

### Task 10: Dashboard & URSSAF ⏱️ 6-8 hours

**Revenue monitoring and French compliance**

**Create**:

1. **Dashboard**:
   - `src/features/dashboard/components/KPICard.tsx`
   - `src/features/dashboard/components/RevenueChart.tsx`
   - `src/features/dashboard/components/URSSAFWidget.tsx`
   - `src/features/dashboard/pages/DashboardPage.tsx`

2. **URSSAF**:
   - `src/features/dashboard/components/PlafondProgress.tsx`
   - `src/features/dashboard/components/CotisationsCalculator.tsx`
   - `src/features/dashboard/components/MonthlyRevenueChart.tsx`

3. **Hooks**:
   - `src/features/dashboard/hooks/useDashboardData.ts`

4. **Utils**:
   - `src/features/dashboard/utils/urssafCalculations.ts`

**Features**:
- ✅ KPIs:
  - CA month (paid invoices only)
  - CA year
  - % vs 77,700€ plafond
  - Cotisations URSSAF (CA × 24.6%)
  - Pending invoices
  - Hours worked this week
- ✅ Charts (Recharts):
  - Monthly revenue (12 months)
  - Service type distribution
- ✅ Alerts:
  - 🚨 TVA threshold (37,500€)
  - 🚨 Plafond exceeded (77,700€)
  - ⚠️ Approaching plafond (90%)

**Deliverable**: Dashboard with URSSAF tracking ✅

---

### Task 11: Testing, Storybook & Deployment ⏱️ 8-10 hours

**Quality assurance and production readiness**

**Storybook**:
```bash
npx storybook@latest init

# Create stories for:
# - UI components (Button, Card, Input, etc.)
# - Complex components (KanbanColumn, ActivityCard, InvoicePDF preview)
```

**Testing**:
```typescript
// Unit tests (Vitest)
// - src/lib/utils.test.ts
// - src/features/dashboard/utils/urssafCalculations.test.ts

// Component tests (React Testing Library)
// - src/features/clients/components/ClientForm.test.tsx
// - src/features/invoices/components/InvoiceForm.test.tsx

// Integration tests
// - src/features/activities/hooks/useActivities.test.ts
```

**Deployment**:
1. Create `.env.production`
2. Create `deploy.sh` script
3. Create `.htaccess` for SPA routing
4. Test build: `npm run build`
5. Deploy to LWS via FTP
6. Configure SSL

**Deliverable**: Production app deployed ✅

---

## Getting Started

### Step 1: Initial Setup (Do This Now)

```bash
# 1. Navigate to project directory
cd /Users/rfernandez/CascadeProjects/windsurf-project-2/freelancetracker

# 2. Create the application
npm create vite@latest freelancer-time-tracker -- --template react-ts

# 3. Move into app directory
cd freelancer-time-tracker

# 4. Install dependencies
npm install

# 5. Test it works
npm run dev
# Should open http://localhost:5173
```

### Step 2: Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in:
   - Name: `freelancer-time-tracker-dev`
   - Database Password: (generate strong password, save it!)
   - Region: (choose closest)
4. Wait 2-3 minutes for provisioning

### Step 3: Configure Environment

```bash
# In freelancer-time-tracker directory
cp .env.example .env.local

# Edit .env.local with your Supabase credentials:
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Step 4: Apply Database Schema

1. Go to Supabase Dashboard → SQL Editor
2. Open `/docs/PRD-COMPLETE.md` in editor
3. Copy lines 70-702 (entire schema)
4. Paste in SQL Editor, click "Run"
5. Verify tables created in Table Editor

### Step 5: Start Building

Follow Task 1 → Task 11 in order. Each task builds on the previous.

---

## Day-by-Day Plan

### Week 1: Foundation

**Day 1-2**: Tasks 1-3 (Scaffolding, Supabase, Infrastructure)
**Day 3-4**: Task 4 (Authentication)
**Day 5**: Task 5 (Clients - start)

### Week 2: Core CRUD

**Day 1-2**: Task 5 (Clients & Projects - complete)
**Day 3**: Task 6 (Rates)
**Day 4-5**: Task 7 (Activities - start)

### Week 3: Advanced Features

**Day 1-3**: Task 7 (Kanban - complete)
**Day 4-5**: Task 8 (Time Tracking)

### Week 4: Invoicing

**Day 1-3**: Task 9 (Invoicing & PDF)
**Day 4-5**: Task 10 (Dashboard - start)

### Week 5: Polish & Deploy

**Day 1-2**: Task 10 (Dashboard - complete)
**Day 3**: Task 11 (Storybook)
**Day 4**: Task 11 (Testing)
**Day 5**: Task 11 (Deployment & Launch)

---

## Success Metrics

### Technical Metrics
- ✅ All TypeScript compiles: `npm run typecheck`
- ✅ No linting errors: `npm run lint`
- ✅ Build succeeds: `npm run build`
- ✅ Tests pass: `npm run test`
- ✅ Test coverage > 80%

### Functional Metrics
- ✅ User can register and login
- ✅ User can create clients and projects
- ✅ Kanban drag-drop updates database
- ✅ Timer creates time entries
- ✅ Invoices generate valid PDFs
- ✅ URSSAF calculations are accurate
- ✅ Real-time updates work

### Performance Metrics
- ✅ Lighthouse score > 85
- ✅ First Contentful Paint < 1.5s
- ✅ Time to Interactive < 3.5s
- ✅ Bundle size < 500KB gzipped

---

## Next Steps

**Right now, do this**:

```bash
# 1. Start Task 1
cd /Users/rfernandez/CascadeProjects/windsurf-project-2/freelancetracker
npm create vite@latest freelancer-time-tracker -- --template react-ts

# 2. Read the setup guide
open docs/SETUP.md

# 3. Create a Supabase account
# Go to https://supabase.com

# 4. Let's build! 🚀
```

**Questions?**
- Check `docs/TROUBLESHOOTING.md` for common issues
- Review `docs/PRD-COMPLETE.md` for detailed specs
- See `docs/EJEMPLOS-CODIGO.md` for code examples

---

**Ready to start? Let's build this! 💪**
