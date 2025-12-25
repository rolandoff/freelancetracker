# Universal PRP Template v1.1.0 - Framework-Agnostic Implementation Guide

## Discovery Summary

### Initial Task Analysis
- Feature scope provided in `templates/INITIAL.md`: build the entire **freelancer-time-tracker** application following `/docs/README.md` and `/docs/PRD-COMPLETE.md`.
- Documents already offer exhaustive PRD plus examples, so clarification questions were unnecessary.

### User Clarifications Received
- None. Source materials already describe workflows, states, database schema, and UI expectations.

### Missing Requirements Identified
- None beyond what PRD covers. Open items such as email delivery for invoices are explicitly scoped for “future,” so MVP excludes them.

## Goal
Deliver a full-stack time-tracking and invoicing platform for French freelancers, covering setup, CRUD modules, Kanban workflow with timers, invoice automation, URSSAF dashboard, and deployment pipeline, exactly as detailed in `docs/PRD-COMPLETE.md`.

## Why
- **Business value**: Centralizes project, time, and billing workflows with French compliance (SIRET, URSSAF, article 293B) to save manual spreadsheet work.
- **Integration**: Tight coupling between Supabase (Auth, DB, Realtime, Storage) and React (Vite, shadcn/ui, TanStack Query) ensures real-time Kanban + billing automation.
- **Pain solved**: Eliminates fragmented tools for freelancers by unifying tracking, invoicing, and URSSAF monitoring in one app.

## What
Implement the system described in the PRD, respecting workflows, data constraints, Supabase schema, and UI conventions. Output must include Storybook, deployment scripts, and validation tooling.

### Success Criteria
- [ ] React + Vite project with Tailwind, shadcn/ui, Zustand, TanStack Query configured per examples.
- [ ] Supabase schema, policies, storage, and triggers deployed and tested.
- [ ] CRUD modules (clients, projects, rates) fully functional with validation.
- [ ] Kanban board (6 states) with dnd-kit drag/drop + Supabase Realtime sync.
- [ ] Time tracking widget + manual entries persisting to `time_entries`.
- [ ] Invoicing flow creates PDFs (article 293B copy) and stores them in Supabase Storage.
- [ ] URSSAF dashboard metrics align with PRD formulas.
- [ ] Storybook and production builds pass `npm run build` and `npm run build:storybook`.
- [ ] Validation commands (`npm run lint`, `npm run test`, `npm run typecheck`) succeed.

## All Needed Context

### Research Phase Summary
- **Codebase patterns found**: Provided in `/examples/EJEMPLOS-CODIGO.md` (Supabase client, hooks, Kanban realtime) and `/docs/PRD-COMPLETE.md` (schema, workflows, UI).
- **External research needed**: **Yes**—dnd-kit best practices for Kanban drag/drop (LogRocket article).
- **Knowledge gaps identified**: Real project doesn’t exist yet; rely on docs + external reference for drag/drop ergonomics (collision detection, sensors).

### Documentation & References
```yaml
- doc: /docs/README.md
  why: High-level instructions, implementation phases, validation commands.

- doc: /docs/PRD-COMPLETE.md
  why: Full PRD (schema, workflows, UI components, acceptance criteria).

- doc: /examples/EJEMPLOS-CODIGO.md
  why: Config files, Supabase helpers, hooks, UI component patterns.

- url: https://blog.logrocket.com/build-kanban-board-dnd-kit-react/
  why: dnd-kit Kanban implementation tips (DndContext, sensors, collision detection) to mirror for activity board.
```

### Current Codebase tree
```bash
.
├── docs/
│   ├── README.md
│   ├── PRD-COMPLETE.md
│   ├── DIAGRAMAS-CASOS-USO.md
│   ├── prps/
│   └── tasks/
├── templates/
│   ├── INITIAL.md
│   ├── prp_base.md
│   └── technical-task.md
├── examples/
│   └── EJEMPLOS-CODIGO.md
└── .windsurf/workflows/
    └── generate-prp.md
```

### Desired Codebase tree (high-level additions once app is generated)
```bash
freelancer-time-tracker/
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── src/
│   ├── lib/supabase.ts
│   ├── components/
│   ├── features/
│   │   ├── auth/
│   │   ├── clients/
│   │   ├── projects/
│   │   ├── rates/
│   │   ├── activities/
│   │   ├── invoices/
│   │   └── dashboard/
│   ├── stores/
│   ├── hooks/
│   ├── pages/
│   └── types/database.types.ts
├── supabase/
│   ├── schema.sql
│   └── seed.sql
├── public/
├── storybook/
└── deploy.sh
```

### Known Gotchas & Library Quirks
```typescript
// Supabase RLS: always use (SELECT auth.uid()) inside policies to avoid performance penalties.
// Storage policies rely on folder convention `${userId}/...`; keep this naming when uploading files.
// dnd-kit requires cleanup of sensors and stable keys; use DndContext + SortableContext with arrays keyed by activity IDs.
// TanStack Query v5: query keys must be arrays; remember to invalidate on mutations and Realtime callbacks.
// @react-pdf/renderer: only accepts inline styles; no Tailwind. Embed legal text exactly as provided.
// Storybook 8 with Vite: ensure `framework: { name: '@storybook/react-vite' }` and match Tailwind styles via preview imports.
// Supabase Realtime: unsubscribe via supabase.removeChannel(channel) inside useEffect cleanup.
```

## Implementation Blueprint

### Data models and structure
- Adopt Supabase schema from PRD (clients, projects, rates, activities, time_entries, invoices, invoice_items, attachments, user_settings).
- Generate TypeScript types via `npx supabase gen types typescript --project-id <id> --schema public > src/types/database.types.ts`.
- Frontend types: create per-feature `types.ts` files mirroring Supabase rows/inserts/updates.
- Validation schemas: use Zod for forms (clients, projects, rates, activities, invoices, time entries). Example:
  ```ts
  const clientSchema = z.object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    siret: z.string().regex(/^\d{14}$/),
    address: z.string().optional(),
  });
  ```

### Task list (ordered)
```yaml
Task 1:
  CREATE freelancer-time-tracker project scaffold
    - Run `npm create vite@latest freelancer-time-tracker -- --template react-ts`
    - Install deps from /examples/EJEMPLOS-CODIGO.md (Supabase, shadcn/ui, Tailwind, Zustand, TanStack Query, @dnd-kit/core, @react-pdf/renderer, react-router-dom, lucide-react, react-day-picker, recharts, @supabase-cache-helpers if desired).
    - Configure tsconfig, tailwind, eslint, prettier following examples.

Task 2:
  CREATE Supabase schema + Storage
    - Apply `docs/PRD-COMPLETE.md` SQL (tables, policies, triggers, views).
    - Create buckets `activity-attachments`, `invoice-pdfs` and policies.
    - Commit schema as `supabase/schema.sql`.

Task 3:
  CREATE shared infrastructure
    - `/src/lib/supabase.ts` from examples.
    - `/src/providers/ThemeProvider.tsx`, layout, sidebar, header referencing docs.
    - `/src/stores/theme.ts`, `/src/stores/timer.ts` via Zustand.

Task 4:
  IMPLEMENT Auth + Settings
    - Hooks `useAuth`, `useSession`.
    - Pages/forms for login/register/forgot + onboarding settings referencing docs §4.1.

Task 5:
  IMPLEMENT Clients/Projects modules
    - Hooks (`useClients`, `useProjects`) using TanStack Query.
    - Forms with react-hook-form + Zod.
    - Detail views with related data counts.

Task 6:
  IMPLEMENT Rates module
    - Management pages ensuring uniqueness constraints (service_type + client).
    - ServiceTypeSelector using PRD enums.

Task 7:
  IMPLEMENT Activities + Kanban + Attachments
    - `KanbanBoard`, `KanbanColumn`, `ActivityCard` using dnd-kit best practices (LogRocket article).
    - Realtime hook `useKanbanRealtime`.
    - Filters by client/project, status lanes sorting.
    - File uploads to Supabase Storage with path `${userId}/${activityId}/${file.name}` and list previews.

Task 8:
  IMPLEMENT Time Tracking
    - Global `TimeTracker` widget docked in sidebar (start/pause/resume).
    - Persist entries to `time_entries`; compute duration via trigger but also optimistic update.
    - Manual entry modal and list per activity.

Task 9:
  IMPLEMENT Invoicing + PDF + Storage
    - Flow to select activities in `por_facturar`, auto-calc totals, apply discounts.
    - `InvoicePDF` component building French-compliant PDF stored in `invoice-pdfs`.
    - Invoice status transitions, auto-numbering check when moving to “en_espera_pago.”

Task 10:
  IMPLEMENT URSSAF + Dashboard modules
    - Queries hitting Supabase views `monthly_revenue_summary`, `annual_revenue_summary`.
    - Charts with Recharts, KPI cards, alerts (TVA threshold 37.5k€, plafond 77.7k€).

Task 11:
  STORYBOOK + Testing + Deployment
    - Configure Storybook 8, add stories for core components.
    - Write Vitest unit tests for hooks (e.g., rates calculation) and React Testing Library for forms.
    - Provide `deploy.sh` (from examples) for LWS (build + copy + .htaccess).
```

### Per-task pseudocode (samples)
```typescript
// Task 7 - Kanban drag/drop update
function handleDragEnd(event: DragEndEvent) {
  const {active, over} = event;
  if (!over || active.id === over.id) return;

  const sourceStatus = activityById[active.id].status;
  const targetStatus = over.data.current?.status;
  if (!isTransitionAllowed(sourceStatus, targetStatus)) {
    toast.error('Transition not allowed');
    return;
  }

  // optimistic update
  queryClient.setQueryData(['activities'], (old) =>
    moveCard(old, active.id, sourceStatus, targetStatus)
  );

  await supabase.from('activities')
    .update({ status: targetStatus })
    .eq('id', active.id);
}

// Task 8 - Timer store (Zustand)
const useTimerStore = create<TimerState>((set, get) => ({
  activeActivityId: null,
  startedAt: null,
  start(activityId) {
    set({ activeActivityId: activityId, startedAt: new Date().toISOString() });
  },
  stop() {
    const { activeActivityId, startedAt } = get();
    if (!activeActivityId || !startedAt) return null;
    return { activityId: activeActivityId, start_time: startedAt, end_time: new Date().toISOString() };
  },
}));
```

### Integration Points
```yaml
DATABASE:
  - Run schema from PRD (section 3). Keep migrations in supabase/ folder.
  - Time entry duration trigger + invoice number trigger already provided.

API:
  - Use Supabase client; no custom backend needed.
  - RLS demands user_id columns on every insert; ensure forms append `user_id`.

STORAGE:
  - Buckets activity-attachments & invoice-pdfs with folder naming `${userId}/${resourceId}/file`.
  - Provide signed URLs for downloads.

ROUTING:
  - React Router v6 with protected layout; `/login`, `/register`, `/forgot-password`, `/app/*`.
  - Nested routes for `/app/clients`, `/app/projects`, `/app/kanban`, `/app/time`, `/app/invoices`, `/app/dashboard`, `/app/settings`.

STATE MANAGEMENT:
  - Global layout state via Zustand (sidebar open, theme, timer).
  - Server data via TanStack Query; keep hooks per feature (`useClients`, `useActivities`, etc.).

STYLES:
  - Tailwind with shadcn tokens; maintain dark/light support using ThemeProvider.
  - Use CSS variables defined in `tailwind.config.js`.
```

## Validation Loop

### Level 1: Syntax & Style
```bash
npm run lint         # ESLint (with @typescript-eslint)
npm run typecheck    # tsc --noEmit
npm run test         # Vitest + React Testing Library
npm run storybook    # Ensure Storybook stories compile locally
```

### Level 2: Build & E2E
```bash
npm run build            # Vite production build
npm run build:storybook  # Static Storybook
```

## Final Validation Checklist
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] `npm run build:storybook`
- [ ] Manual QA: 
  - Kanban drag/drop updates status + persists
  - Timer start/stop creates `time_entries`
  - Invoice PDF stored and downloadable with legal mentions
  - URSSAF dashboard shows correct thresholds
- [ ] Supabase Storage paths secure via policies
- [ ] Deployment via `deploy.sh` succeeds on LWS
- [ ] Link recorded to task breakdown: `docs/tasks/freelancer-time-tracker.md`

## Confidence Score
**8/10** — Requirements are extremely detailed; success hinges on diligent Supabase policy setup and comprehensive UI coverage, but patterns and references are clear.
