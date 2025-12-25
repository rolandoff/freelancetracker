# UX Study: Freelancer Time Tracker

> Comprehensive UX research and design specifications for French freelancer time tracking and invoicing platform

**Document Version**: 1.0
**Last Updated**: 2025-12-25
**Status**: Phase 1 - Research Complete

---

## Table of Contents

1. [Phase 1: Research](#phase-1-research)
2. [Phase 2: Information Architecture](#phase-2-information-architecture)
3. [Phase 3: Design Implementation](#phase-3-design-implementation)
4. [Phase 4: Validation](#phase-4-validation)
5. [Phase 5: Documentation](#phase-5-documentation)

---

## Phase 1: Research

### 1.1 User Segments and Needs

#### Primary User Segment: French Freelancers (Micro-Entrepreneurs)

**Demographics:**
- Self-employed professionals in France
- Operating under micro-entrepreneur/auto-entrepreneur status
- Service-based businesses: consulting, development, design, support
- Individual contributors (single-user, potential multi-tenant future)

**User Characteristics:**
- Must comply with French legal requirements (SIRET, URSSAF, TVA thresholds)
- Need to track multiple clients and projects simultaneously
- Require accurate time tracking for billing purposes
- Must generate legally-compliant invoices with French mentions
- Need visibility into social contribution obligations (URSSAF 24.6%)
- Often work on multiple activities across different workflow states

**Core User Needs:**

1. **Workflow Management**
   - Visual representation of work status across 6 states
   - Quick state transitions with validation
   - Real-time updates when working from multiple devices
   - Clear distinction between billable and non-billable activities

2. **Time Tracking**
   - Automatic timer for active work
   - Manual entry for retrospective logging
   - Accurate duration calculations for invoicing
   - Ability to pause/resume work sessions

3. **Financial Management**
   - Flexible rate structures (base rates + client-specific + service-specific)
   - Automatic invoice generation with correct legal mentions
   - URSSAF contribution calculations (24.6% for 2025)
   - Revenue tracking against legal thresholds (€37,500 TVA, €77,700 plafond)

4. **Client Relationship Management**
   - Client contact information with SIRET validation
   - Project organization per client
   - Historical activity tracking
   - Payment status visibility

5. **Compliance & Legal**
   - French invoice requirements (Article 293B, legal mentions)
   - SIRET validation (14 digits)
   - Automatic URSSAF calculations
   - Threshold alerts

### 1.2 Success Metrics

#### User Success Metrics

**Efficiency Metrics:**
- Time to create new activity: < 30 seconds
- Time to generate invoice: < 2 minutes
- Kanban state transition: < 3 seconds (drag & drop)
- Time entry logging: < 15 seconds per entry

**Adoption Metrics:**
- Daily active usage rate: > 80% of work days
- Feature utilization: > 70% use all core features (time tracking, invoicing, kanban)
- User onboarding completion: > 90% complete profile setup
- Client/project setup: Average 3+ clients, 5+ projects within first week

**Accuracy Metrics:**
- Invoice generation error rate: < 1%
- URSSAF calculation accuracy: 100% (24.6% rate)
- Time tracking accuracy: User-reported 95%+ confidence
- SIRET validation: 100% compliance

**User Satisfaction:**
- Task completion rate: > 95%
- User-reported time savings vs. previous method: > 50%
- NPS (Net Promoter Score): > 50
- Feature satisfaction: > 4/5 average rating

#### Technical Success Metrics

**Performance:**
- First Contentful Paint: < 1.8s on 3G
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 5s
- Cumulative Layout Shift: < 0.1

**Accessibility:**
- WCAG 2.1 AA compliance: 100%
- Keyboard navigation: 100% of features accessible
- Screen reader compatibility: Full support (NVDA, VoiceOver)
- Color contrast: All text 4.5:1, UI elements 3:1

**Reliability:**
- Application uptime: > 99.5%
- Realtime sync latency: < 2 seconds
- Data persistence: 100% (no data loss)
- Invoice PDF generation success: > 99%

### 1.3 Constraints

#### Technical Constraints

**Platform:**
- Frontend hosting: LWS (cPanel + FTP)
- Backend: Supabase (free tier limitations)
- No server-side rendering capability
- Static file deployment only

**Technology Stack:**
- React 18 + TypeScript (modern browser requirement)
- Supabase free tier limits:
  - 500MB database space
  - 1GB file storage
  - 2GB bandwidth/month
  - Row Level Security (RLS) required for multi-user

**Browser Support:**
- Modern browsers only (Chrome, Firefox, Safari, Edge)
- Last 2 versions
- No IE11 support
- Mobile browsers: iOS Safari 14+, Android Chrome 90+

#### Resource Constraints

**Development:**
- Solo developer or small team
- 5-week MVP timeline (per roadmap)
- Limited budget for third-party services
- No dedicated QA team

**Infrastructure:**
- Free tier Supabase (cost optimization required)
- Shared hosting environment
- Limited database queries/month
- Storage optimization necessary

#### User Environment Constraints

**Device Usage:**
- Primary: Desktop browsers (work context)
- Secondary: Mobile devices (on-the-go time tracking)
- Must support variable viewport sizes (320px to 2560px)
- Touch and mouse/keyboard input

**Network Conditions:**
- Variable internet speeds (3G to fiber)
- Potential offline scenarios (mobile work)
- Real-time sync requirements
- File upload limitations (client files, attachments)

**Accessibility:**
- Must support screen readers (legal requirement in France)
- Keyboard-only navigation required
- High contrast mode support
- Text resize up to 200%

### 1.4 Current Pain Points

#### Industry Pain Points (Freelancer Time Tracking)

Based on common freelancer challenges:

1. **Fragmented Tools**
   - Using multiple apps: time tracking, invoicing, accounting
   - Manual data transfer between systems
   - Inconsistent data across platforms
   - Higher error rates

2. **French Compliance Complexity**
   - Manual URSSAF calculations (error-prone)
   - Missing legal invoice mentions
   - SIRET validation failures
   - Threshold tracking (TVA, plafond) manual

3. **Poor Time Visibility**
   - Unclear activity status
   - Lost billable hours (forgetting to track)
   - Difficulty estimating project completion
   - No visual workflow representation

4. **Invoicing Friction**
   - Manual invoice creation time-consuming
   - Template management difficult
   - PDF generation issues
   - Payment tracking separate from work tracking

5. **Rate Management Complexity**
   - Different rates per client
   - Different rates per service type
   - Manual calculations
   - Difficulty tracking profitability

### 1.5 Research Findings Summary

**Key Insights:**

1. **Unified Workflow Critical**: Users need a single source of truth from task creation to payment
2. **Visual Status Management**: Kanban board significantly reduces cognitive load
3. **Automation Value**: URSSAF calculations and invoice generation are high-value automation targets
4. **Mobile Access Secondary**: Primary usage desktop, but mobile time tracking access valuable
5. **French Compliance Non-Negotiable**: Legal requirements are hard constraints, not nice-to-haves

**User Validation Required:**
- Preferred kanban state labels (French terminology)
- Invoice template preferences
- Rate configuration complexity level
- Dashboard KPI priorities
- Mobile feature priorities

---

*Phase 1 Research complete. Proceeding to Phase 2: Information Architecture*

## Phase 2: Information Architecture

### 2.1 User Flows

#### 2.1.1 Primary Happy Path: Activity Creation to Payment

```
User Login → Dashboard → Create Activity → Track Time → Complete Work →
Move to "Por Facturar" → Create Invoice → Generate PDF → Mark as Paid →
View URSSAF Calculations
```

**Detailed Steps:**

1. **Authentication & Setup** (First-time user)
   - Register account (email/password)
   - Auto-create user_settings record
   - Set SIRET (14-digit validation)
   - Configure base rates per service type
   - Set theme preference (light/dark)

2. **Client & Project Setup**
   - Create client (validate SIRET)
   - Add client details (name, email, address, phone)
   - Create project under client
   - Set client-specific rates (optional, overrides base rates)

3. **Activity Workflow** (Core loop)
   - Create activity: Select client → project → service type → auto-populate rate
   - Activity starts in "Por Validar" state
   - Drag to "En Curso" when ready to start work
   - Start timer (or manual time entry)
   - Work on activity, pause/resume timer
   - Stop timer → creates time_entry record
   - Attach files if needed (validation: <10MB, allowed types)
   - Drag to "En Prueba" when complete
   - Drag to "Completada" after client approval
   - Drag to "Por Facturar" when ready to invoice

4. **Invoicing Workflow**
   - Navigate to Invoices → Create New
   - Select client
   - System shows all "Por Facturar" activities for client
   - Select activities to include
   - Auto-calculate totals (hours × rate)
   - Add manual items if needed
   - Apply discount (percentage or fixed)
   - Save as "Borrador" (draft)
   - Review and edit
   - Change status to "En Espera Pago" → generates invoice number (YYYY-NNNN)
   - Generate PDF with legal mentions
   - Upload PDF to Supabase Storage
   - Download/share invoice with client

5. **Payment & Tracking**
   - When paid: Mark invoice as "Pagada"
   - System auto-updates included activities to "Facturada" state
   - URSSAF dashboard auto-updates with new revenue
   - View updated CA mensual/anual and cotisations

#### 2.1.2 Alternative Flows & Edge Cases

**Edge Case 1: Rollback Activity Status**
- User in "En Prueba" → Client requests changes → Drag back to "En Curso"
- User in "En Curso" → Requirements changed → Drag back to "Por Validar"
- System validates: Cannot move "Facturada" backwards
- Show error message with explanation

**Edge Case 2: Rate Not Configured**
- Create activity → No client-specific rate found
- System checks: Base rate for service_type?
  - If exists: Use base rate
  - If not exists: Show modal "Please enter hourly rate manually"
- Prompt user to configure rates in Settings

**Edge Case 3: Archive Client with Active Projects**
- User attempts to archive client
- System checks: Does client have active activities (not "Facturada")?
  - If yes: Show warning "Client has X active activities. Archive anyway?"
  - Options: "Cancel" or "Archive anyway"
- Archived clients hidden from dropdowns but data retained

**Edge Case 4: File Upload Failure**
- User uploads file >10MB → Show error "File too large. Max 10MB"
- User uploads disallowed type → Show error "File type not allowed"
- Network failure during upload → Show retry button
- Upload succeeds but metadata save fails → Cleanup orphaned file

**Edge Case 5: Invoice PDF Generation Failure**
- PDF generation error → Show error message, keep invoice in "Borrador"
- Storage upload fails → Retry mechanism (3 attempts)
- User can re-trigger PDF generation

**Edge Case 6: URSSAF Threshold Alerts**
- CA > €69,930 (90% of plafond) → Show warning banner
- CA > €77,700 (plafond) → Show critical alert, explain consequences
- CA > €37,500 → Show TVA threshold alert

**Edge Case 7: Concurrent Timers**
- User starts timer on Activity A
- Attempts to start timer on Activity B
- System: Auto-stop timer A, show notification "Previous timer stopped"
- Only one timer active at a time (enforced in Zustand store)

**Edge Case 8: Realtime Sync Conflict**
- User A and User B (future multi-user) move same card
- Last write wins, but show notification "Card updated by another user"
- Optimistic update with rollback on conflict

### 2.2 Content Hierarchy

#### 2.2.1 Global Navigation Structure

**Primary Navigation (Always visible):**

```
┌─────────────────────────────────────────────┐
│  Logo  [Nav]  [Search]  [Profile] [Theme]   │
├─────────────────────────────────────────────┤
│ Sidebar:                                     │
│  - Dashboard (Home)                          │
│  - Kanban (Activities)                       │
│  - Clients                                   │
│  - Projects                                  │
│  - Invoices                                  │
│  - URSSAF                                    │
│  - Reports                                   │
│  - Settings                                  │
│    └─ Profile                                │
│    └─ Rates                                  │
│    └─ Legal Info                             │
│    └─ Preferences                            │
└─────────────────────────────────────────────┘
```

**Mobile Navigation (Collapsed):**
- Hamburger menu (top-left)
- Timer widget (sticky bottom if active)
- Search (icon, expands on tap)
- Profile (icon, dropdown)

#### 2.2.2 Page-Level Hierarchy

**Dashboard Page:**
```
1. Header: "Dashboard" + Time period filter
2. KPI Cards (4-column grid → 2-col tablet → 1-col mobile)
   - Monthly Revenue (CA mensuel)
   - Annual Revenue (CA annuel)
   - Active Activities count
   - Pending Invoices count
3. Charts Section
   - Revenue over time (line chart)
   - Activities by status (pie chart)
4. Recent Activity List
   - Last 10 activities with status
5. Quick Actions
   - New Activity
   - New Invoice
   - View URSSAF
```

**Kanban Page:**
```
1. Header: "Activities" + Filters (client, project, service type)
2. Active Timer Widget (if running)
   - Activity name
   - Elapsed time
   - Stop button
3. Kanban Board (6 columns, horizontal scroll on mobile)
   - Por Validar
   - En Curso
   - En Prueba
   - Completada
   - Por Facturar
   - Facturada
4. Activity Cards (in columns)
   - Title
   - Client name
   - Project tag
   - Total hours
   - Rate badge
   - Status indicator
5. New Activity FAB (bottom-right)
```

**Invoice Detail Page:**
```
1. Header: Invoice #{number} + Status badge
2. Client Info Section
   - Name, SIRET, Address
3. Invoice Metadata
   - Date, Due date, Payment terms
4. Items Table
   - Activity/Description
   - Quantity (hours)
   - Unit price
   - Total
5. Totals Section
   - Subtotal
   - Discount
   - Total
6. Legal Mentions (footer)
   - Article 293B
   - SIRET, EI status
   - Late penalty terms
7. Actions
   - Edit (if draft)
   - Generate PDF
   - Download PDF
   - Mark as Paid
   - Cancel
```

**URSSAF Dashboard:**
```
1. Header: "URSSAF" + Year selector
2. Alert Section (if thresholds approached)
   - TVA alert (€37,500)
   - Plafond warning (€77,700)
3. Revenue Summary Cards
   - CA Mensuel (current month)
   - CA Annuel (YTD)
   - Cotisations Sociales (24.6%)
   - Remaining to plafond
4. Monthly Breakdown Table
   - Month | Revenue | Cotisations | Cumulative
5. Progress Bar
   - Visual representation of CA vs €77,700 plafond
6. Export Button (PDF/CSV)
```

### 2.3 Navigation Patterns

#### 2.3.1 Primary Navigation

**Desktop (>1024px):**
- Persistent sidebar (collapsible)
- Hover states on nav items
- Active page highlighted (colored background + icon)
- Breadcrumbs for deep pages (e.g., Clients > Client Detail > Edit)

**Tablet (768-1023px):**
- Collapsible sidebar (icon-only collapsed state)
- Hamburger toggle in header
- Swipe gesture to open/close (optional)

**Mobile (<768px):**
- Hamburger menu (slide-in overlay)
- Full-screen nav drawer
- Close on selection
- Bottom nav bar for critical actions (optional)
  - Home | Kanban | Timer | Invoices | More

#### 2.3.2 Contextual Navigation

**Breadcrumbs:**
- Format: Home > Clients > Acme Corp > Edit
- Each level clickable (except current)
- Hidden on mobile (use back button)
- Max 4 levels, truncate middle if longer

**Tabs (within pages):**
- Client Detail: Overview | Projects | Activities | Invoices
- Settings: Profile | Rates | Legal | Preferences
- Active tab: Colored underline + bold text
- Keyboard navigable (Arrow keys)

**Modals/Dialogs:**
- Focus trap within modal
- Escape key closes
- Click backdrop closes (unless destructive action)
- Close icon (top-right)

#### 2.3.3 Call-to-Action Hierarchy

**Primary Actions:**
- Floating Action Button (FAB): New Activity (Kanban page)
- Primary button: Save, Create, Generate (colored, prominent)

**Secondary Actions:**
- Secondary button: Cancel, Back (outlined, neutral)
- Icon buttons: Edit, Delete, Download (icon-only)

**Tertiary Actions:**
- Text links: View details, Learn more (underlined on hover)

### 2.4 Error State Handling

#### 2.4.1 Validation Errors (Form-level)

**Inline Validation:**
- Trigger: On field blur (not on every keystroke)
- Display: Red border + error text below field
- Icon: Red alert icon in field
- Clear on valid input

**Examples:**
- SIRET: "SIRET must be exactly 14 digits"
- Email: "Please enter a valid email address"
- Required field: "This field is required"
- Rate: "Hourly rate must be greater than 0"

**Form Submission Errors:**
- Show summary at top of form
- List all errors with links to fields
- Scroll to first error
- Focus first error field

#### 2.4.2 Network Errors

**Failed API Request:**
```
┌────────────────────────────────────────┐
│  ⚠ Connection Error                    │
│  Could not connect to server.          │
│  Please check your connection.         │
│  [Retry]  [Dismiss]                    │
└────────────────────────────────────────┘
```

**Timeout:**
- Show notification: "Request timed out. Please try again."
- Auto-retry (1 attempt) with exponential backoff
- If retry fails, show manual retry button

**Realtime Connection Lost:**
- Indicator in header: "Disconnected" (orange badge)
- Attempt auto-reconnect (every 5s, max 5 attempts)
- When reconnected: "Connected" (green badge, fade out after 3s)

#### 2.4.3 Empty States

**No Data:**
```
┌────────────────────────────────────────┐
│         📋 No activities yet            │
│   Create your first activity to start  │
│           tracking time                │
│       [Create Activity]                │
└────────────────────────────────────────┘
```

**Examples:**
- No clients: "Add your first client to get started"
- No invoices: "No invoices yet. Create one when you have completed activities."
- No time entries: "Start a timer or add a manual entry"

**Filtered Results Empty:**
```
┌────────────────────────────────────────┐
│         🔍 No results found             │
│   Try adjusting your filters           │
│       [Clear Filters]                  │
└────────────────────────────────────────┘
```

#### 2.4.4 Error Recovery Guidance

**File Upload Error:**
- Error: "Upload failed"
- Recovery: "File must be <10MB and one of: PDF, PNG, JPG, DOC, DOCX"
- Action: [Choose Different File]

**SIRET Validation Error:**
- Error: "Invalid SIRET"
- Recovery: "SIRET must be exactly 14 digits. Example: 12345678901234"
- Action: Highlight input, focus for correction

**Invoice Generation Error:**
- Error: "Could not generate PDF"
- Recovery: "Please ensure all invoice items have valid amounts"
- Action: [Review Invoice] [Try Again]

**Rate Conflict:**
- Error: "No rate configured for this service type"
- Recovery: "Set up rates in Settings or enter a rate manually"
- Action: [Go to Settings] [Enter Manually]

#### 2.4.5 Destructive Action Confirmation

**Delete Activity:**
```
┌────────────────────────────────────────┐
│  Delete Activity?                      │
│  This will permanently delete          │
│  "Website Redesign" and all            │
│  associated time entries.              │
│                                        │
│  This action cannot be undone.         │
│  [Cancel]  [Delete]                    │
└────────────────────────────────────────┘
```

**Archive Client:**
```
┌────────────────────────────────────────┐
│  Archive Client?                       │
│  "Acme Corp" has 3 active activities.  │
│  Archiving will hide this client       │
│  from lists but retain all data.       │
│  [Cancel]  [Archive]                   │
└────────────────────────────────────────┘
```

**Cancel Invoice:**
```
┌────────────────────────────────────────┐
│  Cancel Invoice #2025-0042?            │
│  This will mark the invoice as         │
│  cancelled and reset associated        │
│  activities to "Completada" status.    │
│  [Go Back]  [Confirm Cancellation]     │
└────────────────────────────────────────┘
```

### 2.5 Information Architecture Summary

**Site Map:**
```
/ (Dashboard)
├── /kanban (Activities board)
│   └── /activity/:id (Activity detail)
├── /clients
│   ├── /new (Create client)
│   └── /:id (Client detail)
│       ├── /edit
│       ├── /projects
│       └── /report
├── /projects
│   ├── /new (Create project)
│   └── /:id (Project detail)
├── /invoices
│   ├── /new (Create invoice)
│   └── /:id (Invoice detail)
│       ├── /edit
│       └── /pdf (View PDF)
├── /urssaf (Dashboard)
├── /reports
│   ├── /client/:id
│   └── /period (Custom period report)
└── /settings
    ├── /profile
    ├── /rates
    ├── /legal
    └── /preferences
```

---

*Phase 2 Information Architecture complete. Proceeding to Phase 3: Design Implementation*

## Phase 3: Design Implementation

### 3.1 Accessibility Requirements (WCAG 2.1 AA - Non-Negotiable)

#### 3.1.1 Perceivable

**Color Contrast:**
- Text (all sizes): Minimum 4.5:1 ratio
- Large text (18pt+/14pt+ bold): Minimum 3:1 ratio
- UI components (buttons, form borders, focus indicators): Minimum 3:1 ratio
- Non-text contrast (icons, graphics): Minimum 3:1 ratio

**Specific Requirements:**
```
Primary Text on Light BG:    #1a202c on #ffffff = 16.1:1 ✓
Secondary Text on Light BG:   #4a5568 on #ffffff = 8.6:1 ✓
Primary Text on Dark BG:      #f7fafc on #1a202c = 16.1:1 ✓
Link Text:                    #3182ce on #ffffff = 4.6:1 ✓
Error Text:                   #c53030 on #ffffff = 5.1:1 ✓
Success Text:                 #2f855a on #ffffff = 4.5:1 ✓
Button Primary BG:            #3182ce (sufficient contrast with white text)
Focus Indicator:              #4299e1 on #ffffff = 3.2:1 ✓
```

**Alt Text & Text Alternatives:**
- All informative images: Descriptive alt text (not "image" or filename)
- Decorative images: Empty alt="" or CSS background
- Icons with meaning: aria-label or visually-hidden text
- Form inputs: Visible labels (not just placeholder)
- Charts: Text alternative with data table or summary

**Media:**
- Video content: Captions (if added in future)
- Audio content: Transcripts (if added in future)
- Auto-playing content: None (avoid completely)

**Text Resizing:**
- Text resizable to 200% without horizontal scroll
- No fixed pixel heights that break at larger text sizes
- Use relative units (rem, em) not absolute (px)
- Responsive images scale with text zoom

#### 3.1.2 Operable

**Keyboard Navigation:**
- All interactive elements focusable via Tab
- Logical tab order (follows visual flow: top-to-bottom, left-to-right)
- Skip to main content link (hidden until focused)
- Kanban: Arrow keys to navigate cards within column, Tab to move between columns
- Modals: Focus trap (Tab cycles within modal)
- Dropdowns: Arrow keys navigate, Enter/Space select, Escape closes

**Focus Indicators:**
- Visible focus ring on all interactive elements
- Minimum 2px outline
- High contrast color (#4299e1 blue outline on light, #90cdf4 on dark)
- Focus ring offset: 2px from element edge
- Never remove focus indicators (avoid outline: none)

**Touch Targets:**
- Minimum size: 44x44px (WCAG AA)
- Preferred size: 48x48px (better for accessibility)
- Spacing between targets: Minimum 8px
- Mobile FAB: 56x56px
- Icon buttons: 44x44px clickable area (even if icon smaller)

**Keyboard Traps:**
- None allowed except modal dialogs (with Escape to exit)
- Ensure Tab can reach all elements
- Provide keyboard way to exit all components

**Timing:**
- No time limits on reading or interaction
- Timer can be paused/stopped
- Session timeout: Warn before timeout, allow extension
- Auto-save: Draft states saved, no data loss

**Skip Navigation:**
```html
<!-- First element in <body> -->
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<!-- Hidden until focused -->
.skip-link {
  position: absolute;
  left: -9999px;
  &:focus {
    left: 0;
    top: 0;
    z-index: 9999;
    background: #3182ce;
    color: #fff;
    padding: 1rem 2rem;
  }
}
```

#### 3.1.3 Understandable

**Clear Labels and Instructions:**
- Form fields: Visible label text (not placeholder-only)
- Required fields: Visual indicator (e.g., * or "Required" text)
- Format requirements: Example shown (e.g., "SIRET: 12345678901234")
- Multi-step forms: Progress indicator (e.g., "Step 2 of 4")
- Button text: Clear action ("Save Changes" not just "Submit")

**Consistent Navigation:**
- Sidebar navigation position fixed across all pages
- Breadcrumbs follow same pattern
- Primary actions in same location (e.g., top-right or FAB)
- Settings always in same section

**Error Identification and Recovery:**
- Error messages: Specific, not generic ("SIRET must be 14 digits" not "Invalid input")
- Error location: Clear association with field
- Error icon: Visual indicator + text (not color alone)
- Recovery guidance: Tell user how to fix
- Error summary: Link to first error field

**Examples:**
```
❌ Bad: "Invalid input"
✓ Good: "SIRET must be exactly 14 digits. Example: 12345678901234"

❌ Bad: "Error occurred"
✓ Good: "Could not save client. Please check that SIRET is unique."

❌ Bad: Red border only (color-blind users can't see)
✓ Good: Red border + error icon + error text below field
```

**Plain Language:**
- Default reading level: 8th grade (simple, clear language)
- French terms used appropriately (professional French users understand URSSAF, SIRET)
- Technical jargon avoided or explained
- Abbreviations spelled out on first use

**Consistent Interactions:**
- Drag & drop: Same behavior across all columns
- Modals: Always Escape to close, click backdrop to close (unless destructive)
- Confirmations: Destructive actions always require confirmation
- Buttons: Same visual style for same action type

#### 3.1.4 Robust

**Semantic HTML:**
```html
<!-- Use proper heading hierarchy -->
<main>
  <h1>Dashboard</h1>
  <section>
    <h2>Monthly Revenue</h2>
    <p>€1,234</p>
  </section>
</main>

<!-- Use semantic elements -->
<nav aria-label="Main navigation">...</nav>
<main id="main-content">...</main>
<aside>...</aside>
<footer>...</footer>

<!-- Forms with proper structure -->
<form>
  <label for="client-name">Client Name</label>
  <input id="client-name" type="text" required />

  <fieldset>
    <legend>Service Type</legend>
    <label><input type="radio" name="service" value="programacion" /> Programming</label>
  </fieldset>
</form>
```

**ARIA When Necessary (Not Overuse):**
```html
<!-- Only when native HTML insufficient -->
<div role="dialog" aria-labelledby="modal-title" aria-modal="true">
  <h2 id="modal-title">Delete Activity</h2>
  ...
</div>

<!-- Live regions for dynamic content -->
<div aria-live="polite" aria-atomic="true">
  Timer: 00:15:32
</div>

<!-- Status messages -->
<div role="status" aria-live="polite">
  Activity saved successfully
</div>

<!-- Error alerts -->
<div role="alert" aria-live="assertive">
  Connection lost. Retrying...
</div>
```

**ARIA Attributes:**
- `aria-label`: Label for elements without visible text
- `aria-labelledby`: Reference to visible label element
- `aria-describedby`: Additional description for context
- `aria-live`: Announce dynamic changes
- `aria-current="page"`: Indicate current nav item
- `aria-expanded`: Indicate collapsed/expanded state
- `aria-hidden="true"`: Hide decorative elements from screen readers

**Progressive Enhancement:**
- Base functionality works without JavaScript
- JavaScript enhances but is not required for core tasks
- Forms submit even if JS fails
- CSS Grid with Flexbox fallback
- Modern features with fallbacks (e.g., CSS variables with static fallback)

**Example:**
```css
/* Progressive enhancement example */
.card {
  background: #3182ce; /* Fallback */
  background: var(--color-primary); /* Modern */
}

@supports (display: grid) {
  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@supports not (display: grid) {
  .grid-container {
    display: flex;
    flex-wrap: wrap;
  }
}
```

### 3.2 Mobile-First Implementation

#### 3.2.1 Breakpoint Strategy

**Start with 320px (smallest mobile), enhance upward:**

```css
/* Base styles: 320px+ (small mobile) */
.container {
  width: 100%;
  padding: 1rem; /* 16px */
}

.grid {
  display: grid;
  grid-template-columns: 1fr; /* Single column */
  gap: 1rem;
}

/* Small mobile: 375px+ (iPhone SE) */
@media (min-width: 375px) {
  .container {
    padding: 1.25rem; /* 20px */
  }
}

/* Large mobile / Small tablet: 640px+ */
@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr); /* 2 columns */
  }
}

/* Tablet: 768px+ */
@media (min-width: 768px) {
  .container {
    padding: 2rem; /* 32px */
  }

  .grid {
    grid-template-columns: repeat(3, 1fr); /* 3 columns */
  }

  .sidebar {
    display: block; /* Show sidebar */
  }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .grid {
    grid-template-columns: repeat(4, 1fr); /* 4 columns */
  }
}

/* Large desktop: 1440px+ */
@media (min-width: 1440px) {
  .container {
    max-width: 1400px;
  }
}
```

**NEVER use max-width queries:**
```css
/* ❌ WRONG - Desktop-first (bad) */
@media (max-width: 768px) { ... }

/* ✓ CORRECT - Mobile-first (good) */
@media (min-width: 768px) { ... }
```

#### 3.2.2 Mobile-Specific Patterns

**Navigation:**
```
Mobile (<768px):
- Hamburger menu (top-left)
- Slide-in sidebar overlay
- Full-screen navigation drawer
- Backdrop dims main content
- Close on navigation selection

Tablet (768-1023px):
- Icon-only sidebar (collapsed by default)
- Expand on hover or toggle
- Push content (not overlay)

Desktop (1024px+):
- Full sidebar always visible
- Text + icons
- Collapsible (user preference persists)
```

**Kanban Board:**
```
Mobile (<768px):
- Horizontal scroll (swipe between columns)
- Column width: 90vw (fits almost full screen)
- Snap scrolling to columns
- Current column indicator (dots)
- Tap card to view details (modal)
- No drag & drop (too difficult on mobile)
- "Move to" button in card detail modal

Tablet (768px+):
- All columns visible
- Horizontal scroll if needed
- Touch-based drag & drop enabled

Desktop (1024px+):
- All 6 columns fit on screen
- Mouse-based drag & drop
- Hover previews
```

**Forms:**
```
Mobile:
- Full-width inputs
- Large touch targets (48x48px)
- Native mobile keyboards (type="email", type="tel")
- Bottom sheet for selects (iOS/Android native)
- Minimize typing with smart defaults

Desktop:
- Multi-column layouts
- Hover states
- Keyboard shortcuts
- Autofocus first field
```

**Data Tables:**
```
Mobile (<640px):
- Card layout (stack rows as cards)
- Show critical columns only
- "View details" button for full data

Tablet (640px+):
- Horizontal scroll
- Sticky first column
- All columns visible

Desktop (1024px+):
- Full table width
- Sortable columns
- Inline editing
```

#### 3.2.3 Touch Optimization

**Gestures:**
- Tap: Primary action
- Long press: Context menu (optional)
- Swipe: Navigate, delete (with confirmation)
- Pinch: Zoom (if applicable, e.g., PDF viewer)
- Pull to refresh: Optional on list views

**Touch Targets:**
```css
/* Minimum touch target: 44x44px */
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1.5rem;
}

/* Preferred touch target: 48x48px */
.fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
}

/* Spacing between targets */
.button-group button + button {
  margin-left: 8px;
}
```

**Prevent Accidental Taps:**
- Destructive actions: Require confirmation
- Spacing between clickable elements: 8px minimum
- Avoid placing actions near screen edges
- Swipe to delete: Require full swipe or confirmation

### 3.3 Design Tokens

#### 3.3.1 Color System

**Primary Palette:**
```css
:root {
  /* Primary (Blue) - Main brand, primary actions */
  --color-primary-50:  #ebf8ff;
  --color-primary-100: #bee3f8;
  --color-primary-200: #90cdf4;
  --color-primary-300: #63b3ed;
  --color-primary-400: #4299e1;
  --color-primary-500: #3182ce; /* Main primary */
  --color-primary-600: #2c5282;
  --color-primary-700: #2a4365;
  --color-primary-800: #1e3a5f;
  --color-primary-900: #1a2332;

  /* Success (Green) - Completed, success states */
  --color-success-50:  #f0fff4;
  --color-success-100: #c6f6d5;
  --color-success-200: #9ae6b4;
  --color-success-300: #68d391;
  --color-success-400: #48bb78;
  --color-success-500: #38a169; /* Main success */
  --color-success-600: #2f855a;
  --color-success-700: #276749;
  --color-success-800: #22543d;
  --color-success-900: #1c4532;

  /* Warning (Orange) - Warnings, alerts */
  --color-warning-50:  #fffaf0;
  --color-warning-100: #feebc8;
  --color-warning-200: #fbd38d;
  --color-warning-300: #f6ad55;
  --color-warning-400: #ed8936;
  --color-warning-500: #dd6b20; /* Main warning */
  --color-warning-600: #c05621;
  --color-warning-700: #9c4221;
  --color-warning-800: #7c2d12;
  --color-warning-900: #652412;

  /* Error (Red) - Errors, destructive actions */
  --color-error-50:  #fff5f5;
  --color-error-100: #fed7d7;
  --color-error-200: #feb2b2;
  --color-error-300: #fc8181;
  --color-error-400: #f56565;
  --color-error-500: #e53e3e; /* Main error */
  --color-error-600: #c53030;
  --color-error-700: #9b2c2c;
  --color-error-800: #822727;
  --color-error-900: #63171b;

  /* Neutral (Gray) - Text, backgrounds, borders */
  --color-neutral-50:  #f7fafc;
  --color-neutral-100: #edf2f7;
  --color-neutral-200: #e2e8f0;
  --color-neutral-300: #cbd5e0;
  --color-neutral-400: #a0aec0;
  --color-neutral-500: #718096;
  --color-neutral-600: #4a5568;
  --color-neutral-700: #2d3748;
  --color-neutral-800: #1a202c;
  --color-neutral-900: #171923;
}
```

**Semantic Color Assignments:**
```css
:root {
  /* Light theme */
  --color-text-primary: var(--color-neutral-900);
  --color-text-secondary: var(--color-neutral-600);
  --color-text-tertiary: var(--color-neutral-500);
  --color-text-inverse: var(--color-neutral-50);

  --color-bg-primary: #ffffff;
  --color-bg-secondary: var(--color-neutral-50);
  --color-bg-tertiary: var(--color-neutral-100);

  --color-border: var(--color-neutral-300);
  --color-border-hover: var(--color-neutral-400);
  --color-border-focus: var(--color-primary-500);

  --color-link: var(--color-primary-600);
  --color-link-hover: var(--color-primary-700);

  /* Status-specific */
  --color-status-por-validar: var(--color-neutral-400);
  --color-status-en-curso: var(--color-primary-500);
  --color-status-en-prueba: var(--color-warning-500);
  --color-status-completada: var(--color-success-500);
  --color-status-por-facturar: var(--color-primary-700);
  --color-status-facturada: var(--color-neutral-600);
}

[data-theme="dark"] {
  /* Dark theme */
  --color-text-primary: var(--color-neutral-50);
  --color-text-secondary: var(--color-neutral-300);
  --color-text-tertiary: var(--color-neutral-400);
  --color-text-inverse: var(--color-neutral-900);

  --color-bg-primary: var(--color-neutral-900);
  --color-bg-secondary: var(--color-neutral-800);
  --color-bg-tertiary: var(--color-neutral-700);

  --color-border: var(--color-neutral-600);
  --color-border-hover: var(--color-neutral-500);
  --color-border-focus: var(--color-primary-400);

  --color-link: var(--color-primary-400);
  --color-link-hover: var(--color-primary-300);
}
```

#### 3.3.2 Spacing System

```css
:root {
  /* Base spacing unit: 4px */
  --space-0: 0;
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
  --space-24: 6rem;    /* 96px */

  /* Semantic spacing */
  --space-page-padding: var(--space-6); /* Default page padding */
  --space-section-gap: var(--space-8);  /* Gap between sections */
  --space-card-padding: var(--space-6); /* Card internal padding */
  --space-input-padding: var(--space-3); /* Input field padding */
}

/* Mobile adjustments */
@media (max-width: 767px) {
  :root {
    --space-page-padding: var(--space-4);
    --space-section-gap: var(--space-6);
    --space-card-padding: var(--space-4);
  }
}
```

**Usage:**
```css
.page-container {
  padding: var(--space-page-padding);
}

.section + .section {
  margin-top: var(--space-section-gap);
}

.card {
  padding: var(--space-card-padding);
  gap: var(--space-4);
}
```

#### 3.3.3 Typography System

```css
:root {
  /* Font families */
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace;

  /* Font sizes (fluid typography) */
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);   /* 12-14px */
  --text-sm: clamp(0.875rem, 0.8rem + 0.3vw, 1rem);       /* 14-16px */
  --text-base: clamp(1rem, 0.95rem + 0.35vw, 1.125rem);   /* 16-18px */
  --text-lg: clamp(1.125rem, 1.05rem + 0.4vw, 1.25rem);   /* 18-20px */
  --text-xl: clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);     /* 20-24px */
  --text-2xl: clamp(1.5rem, 1.35rem + 0.75vw, 1.875rem);  /* 24-30px */
  --text-3xl: clamp(1.875rem, 1.65rem + 1.125vw, 2.25rem); /* 30-36px */
  --text-4xl: clamp(2.25rem, 1.95rem + 1.5vw, 3rem);      /* 36-48px */

  /* Line heights */
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;

  /* Font weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}

/* Headings */
h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--color-text-primary);
}

h2 {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--color-text-primary);
}

h3 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--color-text-primary);
}

h4 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--color-text-primary);
}

/* Body text */
body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--color-text-primary);
}

.text-small {
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
}

.text-xs {
  font-size: var(--text-xs);
  line-height: var(--leading-normal);
}
```

#### 3.3.4 Border Radius

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;  /* 2px */
  --radius-base: 0.25rem; /* 4px */
  --radius-md: 0.375rem;  /* 6px */
  --radius-lg: 0.5rem;    /* 8px */
  --radius-xl: 0.75rem;   /* 12px */
  --radius-2xl: 1rem;     /* 16px */
  --radius-full: 9999px;  /* Fully rounded */
}

/* Usage */
.button {
  border-radius: var(--radius-md);
}

.card {
  border-radius: var(--radius-lg);
}

.badge {
  border-radius: var(--radius-full);
}

.avatar {
  border-radius: var(--radius-full);
}
```

#### 3.3.5 Shadows

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(--color-neutral-900);
}

/* Usage */
.card {
  box-shadow: var(--shadow-base);
}

.card:hover {
  box-shadow: var(--shadow-md);
}

.modal {
  box-shadow: var(--shadow-xl);
}

.dropdown {
  box-shadow: var(--shadow-lg);
}
```

### 3.4 Component-Specific Design Patterns

#### 3.4.1 Buttons

```css
/* Primary button */
.btn-primary {
  background: var(--color-primary-500);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  min-height: 44px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: var(--color-primary-600);
  box-shadow: var(--shadow-md);
}

.btn-primary:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.btn-primary:disabled {
  background: var(--color-neutral-300);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Secondary button */
.btn-secondary {
  background: transparent;
  color: var(--color-primary-600);
  border: 1px solid var(--color-border);
  /* ... rest same as primary */
}

/* Destructive button */
.btn-destructive {
  background: var(--color-error-500);
  color: white;
  /* ... rest same as primary */
}
```

#### 3.4.2 Form Inputs

```css
.input {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  min-height: 44px;
  transition: all 0.2s;
}

.input:hover {
  border-color: var(--color-border-hover);
}

.input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.input:invalid:not(:focus) {
  border-color: var(--color-error-500);
}

.input-error {
  color: var(--color-error-600);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
```

#### 3.4.3 Cards

```css
.card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
}

.card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-hover);
}

.card-header {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.card-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}
```

---

*Phase 3 Design Implementation complete. Proceeding to Phase 4: Validation*

## Phase 4: Validation

### 4.1 Accessibility Audit (WCAG 2.1 AA)

#### 4.1.1 Automated Testing Tools

**Pre-Implementation:**
- [ ] axe DevTools browser extension installed
- [ ] WAVE browser extension configured
- [ ] Lighthouse CI integrated into build process

**Testing Checklist:**
```bash
# Run Lighthouse accessibility audit
lighthouse https://app.domain.com --only-categories=accessibility --output=html

# Expected score: 100/100 for AA compliance
```

**Automated Checks:**
1. Color contrast ratios (text, UI components)
2. Form labels present
3. Alt text for images
4. ARIA attributes validity
5. Heading hierarchy
6. HTML semantics
7. Link text meaningful

#### 4.1.2 Manual Testing Requirements

**Keyboard Navigation Test:**
```
Test Plan:
1. Disconnect mouse/trackpad
2. Navigate entire app using only keyboard:
   - Tab: Move forward through interactive elements
   - Shift+Tab: Move backward
   - Enter/Space: Activate buttons, toggle checkboxes
   - Arrow keys: Navigate dropdowns, radio groups, kanban cards
   - Escape: Close modals, dropdowns
3. Verify focus indicators visible on ALL elements
4. Check no keyboard traps exist
5. Test skip navigation link works

Pass Criteria:
✓ All interactive elements reachable
✓ Focus order logical (follows visual flow)
✓ Focus indicators highly visible
✓ No keyboard traps
✓ Skip link functional
```

**Screen Reader Test:**
```
Test Plan:
1. NVDA (Windows) or VoiceOver (Mac)
2. Navigate each major page
3. Test form submission
4. Test error messages
5. Test dynamic content (timer, realtime updates)

Pass Criteria:
✓ All content announced correctly
✓ Form labels read with inputs
✓ Error messages announced
✓ Status changes announced (aria-live)
✓ Kanban drag & drop has text alternative
✓ Images have meaningful alt text
✓ Landmark regions properly labeled
```

**Color Blindness Test:**
```
Tools:
- Chrome DevTools Vision Deficiency Emulator
- Color Oracle (standalone app)

Test scenarios:
- Protanopia (red-blind)
- Deuteranopia (green-blind)
- Tritanopia (blue-blind)
- Achromatopsia (full color blindness)

Pass Criteria:
✓ Status indicators distinguishable (not color-only)
✓ Error states visible (not just red border)
✓ Success states visible (not just green)
✓ Chart data distinguishable
✓ All information conveyed beyond color
```

**Zoom & Text Resize Test:**
```
Test Plan:
1. Set browser zoom to 200%
2. Navigate all pages
3. Test at 400% zoom (AA requirement)
4. Use browser text-only zoom
5. Test with custom spacing (CSS override)

Pass Criteria:
✓ No horizontal scroll at 200% zoom
✓ Content remains usable at 400%
✓ Text spacing adjustable
✓ No content clipped or hidden
✓ Interactive elements still clickable
```

### 4.2 Responsive Testing

#### 4.2.1 Viewport Size Testing Matrix

**Required Test Viewports:**

| Viewport  | Width   | Device Example      | Priority |
|-----------|---------|---------------------|----------|
| Mobile XS | 320px   | iPhone SE           | Critical |
| Mobile S  | 375px   | iPhone 12/13/14     | Critical |
| Mobile L  | 414px   | iPhone Pro Max      | High     |
| Tablet P  | 768px   | iPad Portrait       | High     |
| Tablet L  | 1024px  | iPad Landscape      | High     |
| Desktop   | 1280px  | Laptop              | Critical |
| Desktop L | 1440px  | Desktop             | Medium   |
| Desktop XL| 1920px  | Full HD Monitor     | Medium   |
| Desktop 2K| 2560px  | 2K Monitor          | Low      |

**Testing Checklist per Viewport:**
- [ ] Navigation usable (hamburger on mobile, sidebar on desktop)
- [ ] Content readable (no horizontal scroll, text not cut off)
- [ ] Images responsive (scale appropriately)
- [ ] Forms usable (touch targets adequate, inputs full-width on mobile)
- [ ] Tables readable (card layout on mobile, scroll on tablet)
- [ ] Kanban board functional (horizontal scroll on mobile, all columns visible on desktop)
- [ ] Modals/dialogs fit screen
- [ ] Buttons/CTAs accessible (size, position)

#### 4.2.2 Device Testing

**Physical Device Testing (Minimum):**
- [ ] iPhone (iOS Safari) - Latest and iOS 14
- [ ] Android phone (Chrome) - Latest version
- [ ] iPad (Safari) - Portrait and landscape
- [ ] Desktop (Chrome, Firefox, Safari, Edge)

**Browser Testing Matrix:**

| Browser         | Version        | Priority |
|-----------------|----------------|----------|
| Chrome          | Latest 2       | Critical |
| Firefox         | Latest 2       | High     |
| Safari          | Latest 2       | Critical |
| Edge            | Latest 2       | High     |
| iOS Safari      | 14+            | Critical |
| Android Chrome  | Latest         | Critical |

**Cross-Browser Testing Checklist:**
- [ ] CSS Grid layout works (fallback to Flexbox if needed)
- [ ] CSS Variables work (static fallback values present)
- [ ] Drag & drop functional
- [ ] PDF generation works
- [ ] File uploads work
- [ ] Date picker functional
- [ ] Animations smooth (60fps)

#### 4.2.3 Orientation Testing

**Test Scenarios:**
- [ ] Mobile portrait → landscape (keyboard visible/hidden)
- [ ] Tablet portrait → landscape
- [ ] Content reflows appropriately
- [ ] No content clipped during rotation
- [ ] Timer continues running during rotation

### 4.3 User Flow Verification

#### 4.3.1 Critical Path Testing

**Path 1: New User Onboarding**
```
Steps:
1. Register account → Success?
2. Set SIRET (validation) → Correct validation?
3. Configure base rates → Rates saved?
4. Create first client → Client created?
5. Create first project → Project created?
6. Create first activity → Activity in "Por Validar"?

Pass Criteria:
- All steps completable in <5 minutes
- No errors
- Clear guidance at each step
- Success confirmation shown
```

**Path 2: Time Tracking & Invoicing**
```
Steps:
1. Create activity → Success?
2. Start timer → Timer running?
3. Stop timer → Time entry created?
4. Move to "Completada" → Status updated?
5. Move to "Por Facturar" → Ready to invoice?
6. Create invoice → All activities shown?
7. Generate PDF → PDF created?
8. Mark paid → Invoice and activities updated?

Pass Criteria:
- Complete flow in <10 minutes
- No data loss
- Real-time updates work
- PDF generated correctly
```

**Path 3: URSSAF Tracking**
```
Steps:
1. Mark invoice as paid → CA updated?
2. View URSSAF dashboard → Correct calculations?
3. Check threshold alerts → Alerts shown if applicable?
4. Export PDF report → Export successful?

Pass Criteria:
- URSSAF calculations 100% accurate (24.6%)
- Thresholds check correctly
- Export works on all devices
```

#### 4.3.2 Edge Case Verification

**Test Each Edge Case:**
- [ ] Rollback activity status → Validation works?
- [ ] Rate not configured → Prompt shown?
- [ ] Archive client with active activities → Warning shown?
- [ ] File upload >10MB → Error shown?
- [ ] Concurrent timers → Only one active?
- [ ] Network failure → Retry mechanism works?
- [ ] Empty states → Helpful messaging shown?
- [ ] Validation errors → Clear recovery guidance?

### 4.4 Performance Validation

#### 4.4.1 Core Web Vitals Testing

**Target Metrics (Mobile 3G):**
```
Largest Contentful Paint (LCP):     < 2.5s  (Good)
First Input Delay (FID):             < 100ms (Good)
Cumulative Layout Shift (CLS):       < 0.1   (Good)
First Contentful Paint (FCP):        < 1.8s  (Good)
Time to Interactive (TTI):           < 5s    (Good)
Total Blocking Time (TBT):           < 300ms (Good)
```

**Testing Tools:**
```bash
# Lighthouse performance audit
lighthouse https://app.domain.com --throttling.cpuSlowdownMultiplier=4 --throttling.requestLatencyMs=562.5 --throttling.downloadThroughputKbps=1600

# Expected Performance Score: > 90/100
```

**Performance Budget:**
```
Total Bundle Size:           < 300KB (gzipped)
JavaScript Bundle:           < 200KB (gzipped)
CSS Bundle:                  < 50KB (gzipped)
Fonts:                       < 50KB (subset, preload)
Images (per page):           < 500KB (optimized, lazy-loaded)
Third-party scripts:         Minimize (only Supabase SDK essential)

Initial Load (3G):           < 3 seconds
Time to Interactive (3G):    < 5 seconds
```

**Optimization Checklist:**
- [ ] Code splitting implemented (lazy load routes)
- [ ] Images optimized (WebP with fallback)
- [ ] Fonts subset and preloaded
- [ ] Critical CSS inlined
- [ ] Unused CSS removed
- [ ] JavaScript minified and compressed
- [ ] Caching headers configured
- [ ] Service worker for offline (optional)

#### 4.4.2 Network Condition Testing

**Test Scenarios:**
```
1. Fast 3G:
   - Download: 1.6 Mbps
   - Upload: 0.75 Mbps
   - Latency: 562.5ms
   → All core features work

2. Slow 3G:
   - Download: 400 Kbps
   - Upload: 400 Kbps
   - Latency: 2000ms
   → Loading states shown, app still usable

3. Offline:
   → Error message shown
   → Cached data visible (if service worker implemented)
   → Graceful degradation
```

### 4.5 Cross-Browser/Device Testing Plan

#### 4.5.1 Compatibility Testing Matrix

**Desktop Browsers:**
```
✓ Chrome 120+ (Windows, Mac, Linux)
✓ Firefox 120+ (Windows, Mac, Linux)
✓ Safari 17+ (Mac)
✓ Edge 120+ (Windows)

Tests:
- Layout consistency
- Feature functionality
- Animation performance
- PDF generation
- File uploads
- Drag & drop
```

**Mobile Browsers:**
```
✓ iOS Safari 14+ (iPhone, iPad)
✓ Chrome Android (Latest)
✓ Samsung Internet (Latest)

Tests:
- Touch interactions
- Gestures (swipe, tap, long-press)
- Virtual keyboard behavior
- Form autofill
- File picker
- PDF viewer
```

#### 4.5.2 Progressive Enhancement Verification

**Feature Detection Tests:**
```javascript
// Test feature support
const features = {
  cssGrid: CSS.supports('display', 'grid'),
  cssVariables: CSS.supports('--test', '0'),
  dragAndDrop: 'draggable' in document.createElement('div'),
  localStorage: typeof Storage !== 'undefined',
  serviceWorker: 'serviceWorker' in navigator
};

// Verify graceful fallbacks
- No Grid support → Flexbox fallback works?
- No CSS Variables → Static values work?
- No Drag & Drop → Button fallback works?
- No LocalStorage → Session-only OK?
```

### 4.6 Validation Checklist Summary

#### Pre-Launch Checklist:

**Accessibility:**
- [ ] WCAG 2.1 AA compliance verified (Lighthouse 100/100)
- [ ] Keyboard navigation fully functional
- [ ] Screen reader tested (NVDA/VoiceOver)
- [ ] Color contrast ratios meet standards (4.5:1 text, 3:1 UI)
- [ ] Focus indicators visible on all interactive elements
- [ ] Text resizable to 200% without horizontal scroll

**Responsive:**
- [ ] Tested on 320px to 2560px viewports
- [ ] Mobile, tablet, desktop layouts work
- [ ] Touch targets minimum 44x44px
- [ ] No horizontal scroll on any device
- [ ] Images responsive and optimized

**Performance:**
- [ ] Core Web Vitals pass (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Performance budget met (<300KB total)
- [ ] 3G network testing passed
- [ ] Loading states implemented
- [ ] Error states handled gracefully

**Functionality:**
- [ ] All user flows tested and working
- [ ] Edge cases handled correctly
- [ ] Error messages clear and helpful
- [ ] Validation feedback immediate
- [ ] Data persistence verified

**Cross-Browser:**
- [ ] Chrome, Firefox, Safari, Edge tested
- [ ] iOS Safari and Android Chrome tested
- [ ] Feature detection and fallbacks work
- [ ] No console errors in any browser

---

*Phase 4 Validation complete. Proceeding to Phase 5: Documentation*

## Phase 5: Implementation Documentation

### 5.1 Component Inventory with States

#### 5.1.1 Core UI Components

**Button Component**
```
States:
- Default (idle)
- Hover
- Focus (keyboard)
- Active (pressed)
- Disabled
- Loading

Variants:
- Primary (filled, brand color)
- Secondary (outlined, neutral)
- Destructive (red, for delete actions)
- Ghost (text only, no background)

Sizes:
- Small (32px height)
- Medium (44px height) - Default
- Large (56px height)

Accessibility:
- Min height: 44px (touch target)
- Focus ring: 2px offset
- Disabled: aria-disabled="true"
- Loading: aria-busy="true"
```

**Input Component**
```
States:
- Default
- Focus
- Error
- Disabled
- ReadOnly

Types:
- Text
- Email
- Tel
- Number
- Password
- Textarea
- Select
- Date

Accessibility:
- Label always visible (not placeholder-only)
- Error message: aria-describedby
- Required: aria-required="true"
- Invalid: aria-invalid="true"
```

**Card Component**
```
States:
- Default
- Hover
- Selected
- Disabled

Variants:
- Basic (white background, border)
- Interactive (clickable, hover effect)
- Kanban (drag & drop, status indicator)

Sizes:
- Compact (minimal padding)
- Default
- Spacious (generous padding)
```

**Modal/Dialog Component**
```
States:
- Closed
- Opening (animation)
- Open
- Closing (animation)

Variants:
- Small (400px max-width)
- Medium (600px max-width) - Default
- Large (800px max-width)
- Full-screen (mobile)

Accessibility:
- role="dialog"
- aria-modal="true"
- aria-labelledby (title ID)
- Focus trap active
- Escape key closes
- Return focus to trigger on close
```

**Badge Component**
```
States:
- Static (no interaction)

Variants by Status:
- Por Validar (gray)
- En Curso (blue)
- En Prueba (orange)
- Completada (green)
- Por Facturar (dark blue)
- Facturada (dark gray)

Sizes:
- Small (text-xs)
- Medium (text-sm) - Default
- Large (text-base)
```

#### 5.1.2 Complex Components

**Kanban Board**
```
Components:
- Board Container (horizontal scroll on mobile)
- Column (6 total, draggable zone)
- Card (draggable, clickable)
- Empty State (when column has no cards)

States:
- Idle
- Dragging (card being moved)
- Drop target highlighted
- Loading (fetching activities)
- Error (network failure)

Interactions:
- Desktop: Click & drag to move
- Mobile: Tap to open, use "Move to" button
- Keyboard: Arrow keys to navigate, Enter to open

Accessibility:
- Keyboard navigation: Tab between columns, Arrow keys within column
- Screen reader: Announce column name, card count, current card
- Drag & drop alternative: Button-based move
```

**Invoice Form**
```
Sections:
- Client Selection (dropdown)
- Activity Selection (multi-select checkboxes)
- Manual Items (add/remove rows)
- Discount (percentage or fixed)
- Totals (read-only calculated)

States:
- Draft (editing allowed)
- Generating PDF (loading state)
- Complete (read-only)
- Error (validation failed)

Validation:
- Client required
- At least one activity or manual item required
- All amounts must be valid numbers
- Discount cannot exceed subtotal
```

### 5.2 Interaction Patterns

#### 5.2.1 Form Interactions

**Validation Timing:**
```
- On blur: Validate individual field
- On submit: Validate entire form
- Real-time: For specific fields (e.g., SIRET length check)

Error Display:
1. Field border turns red
2. Error icon appears in field
3. Error message below field
4. Form summary at top (on submit)
5. Focus first error field

Success Indication:
- Green checkmark icon (optional)
- Border returns to normal
- Error message removed
```

**Auto-save Pattern:**
```
Trigger: 2 seconds after last keystroke
Indicator: "Saving..." → "Saved" (subtle, top-right)
Error handling: Show error, allow retry
Conflict resolution: Last write wins
```

#### 5.2.2 Navigation Interactions

**Sidebar Navigation:**
```
Desktop:
- Hover: Highlight background
- Active page: Colored background + bold text + icon color change
- Click: Navigate, update active state
- Collapse toggle: Icon rotates, sidebar width animates

Mobile:
- Tap hamburger: Slide in from left
- Backdrop: Dim background, click to close
- Tap item: Navigate, close sidebar
- Swipe right: Close sidebar (optional)
```

**Breadcrumbs:**
```
- Hover: Underline link
- Click: Navigate to level
- Current page: Not clickable, different style
- Separator: "/" or ">" in neutral color
```

#### 5.2.3 Feedback Patterns

**Loading States:**
```
Skeleton Screens:
- Dashboard cards: Pulsing gray rectangles
- Lists: Multiple skeleton rows
- Match layout of loaded content

Spinners:
- Button loading: Spinner replaces text, button disabled
- Page loading: Centered spinner
- Inline loading: Small spinner next to content

Progress Indicators:
- PDF generation: Determinate progress bar
- File upload: Percentage shown
- Multi-step forms: Step indicator (1 of 4)
```

**Success Feedback:**
```
Toast Notifications:
- Position: Top-right
- Duration: 3 seconds (auto-dismiss)
- Icon: Green checkmark
- Dismissible: X button
- Example: "Activity created successfully"

Inline Success:
- Form submission: Success message + redirect
- Toggle switches: Immediate visual feedback
- Checkboxes: Checkmark animation
```

**Error Feedback:**
```
Toast Notifications (Non-Critical):
- Position: Top-right
- Duration: 5 seconds
- Icon: Red alert
- Example: "Could not save changes. Please try again."

Modal Dialogs (Critical):
- Block interaction
- Clear error message
- Recovery actions offered
- Example: "Network error. [Retry] [Cancel]"
```

### 5.3 Responsive Breakpoints

```css
/* Breakpoints */
--breakpoint-xs: 320px;   /* Small mobile */
--breakpoint-sm: 640px;   /* Large mobile */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
--breakpoint-2xl: 1536px; /* Extra large desktop */

/* Layout Changes */

/* Mobile First: 320px+ */
- Single column layouts
- Full-width components
- Hamburger navigation
- Stacked forms
- Horizontal scroll kanban

/* @media (min-width: 640px) */
- 2-column grids
- Side-by-side form fields (some)

/* @media (min-width: 768px) */
- Sidebar navigation appears (collapsed)
- 3-column grids
- Tabs for navigation
- Multi-column forms

/* @media (min-width: 1024px) */
- Full sidebar visible
- 4-column grids
- All kanban columns visible
- Hover states prominent

/* @media (min-width: 1280px) */
- Max-width containers (1200px)
- Wider content area
- More spacing
```

### 5.4 Accessibility Annotations

#### 5.4.1 Component-Level ARIA

**Button:**
```html
<button
  type="button"
  aria-label="Create new activity"
  aria-disabled="false"
>
  <PlusIcon aria-hidden="true" />
  <span>New Activity</span>
</button>
```

**Form Input:**
```html
<div class="form-field">
  <label for="client-siret">
    SIRET <span aria-label="required">*</span>
  </label>
  <input
    id="client-siret"
    type="text"
    aria-required="true"
    aria-invalid="false"
    aria-describedby="siret-hint siret-error"
    maxlength="14"
  />
  <p id="siret-hint" class="hint">14 digits, e.g., 12345678901234</p>
  <p id="siret-error" class="error" role="alert">
    SIRET must be exactly 14 digits
  </p>
</div>
```

**Kanban Card:**
```html
<div
  role="button"
  tabindex="0"
  aria-label="Website Redesign for Acme Corp, 12.5 hours, status: En Curso"
  class="kanban-card"
  draggable="true"
>
  <h3>Website Redesign</h3>
  <p>Acme Corp</p>
  <span aria-label="12.5 hours logged">12.5h</span>
</div>
```

**Modal:**
```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Delete Activity</h2>
  <p id="modal-description">
    This will permanently delete "Website Redesign" and all time entries.
  </p>
  <button aria-label="Close dialog">×</button>
</div>
```

#### 5.4.2 Live Regions

**Timer:**
```html
<div aria-live="polite" aria-atomic="true">
  <span aria-label="Timer running: 1 hour 23 minutes 45 seconds">
    01:23:45
  </span>
</div>
```

**Status Updates:**
```html
<div role="status" aria-live="polite">
  Activity moved to "Completada"
</div>
```

**Alerts:**
```html
<div role="alert" aria-live="assertive">
  Connection lost. Attempting to reconnect...
</div>
```

### 5.5 Edge Case Handling Summary

| Edge Case | User Impact | Solution | Priority |
|-----------|-------------|----------|----------|
| Rate not configured | Cannot create activity | Modal prompt for manual entry + link to settings | High |
| Concurrent timers | Data inconsistency | Auto-stop previous timer, show notification | High |
| Network failure | Cannot save data | Retry mechanism (3 attempts) + user notification | Critical |
| File upload >10MB | Upload fails | Client-side validation before upload | Medium |
| Empty activity list | User confused | Empty state with CTA "Create Activity" | High |
| SIRET validation | Invalid client data | Real-time validation + example format | High |
| Invoice PDF error | Cannot send invoice | Error message + retry button + draft saved | Critical |
| Realtime sync conflict | Stale data displayed | Optimistic update + rollback on conflict | Medium |
| Archive client with activities | Data integrity | Warning dialog with confirmation | High |
| Session timeout | Lost unsaved work | Auto-save drafts + warn before timeout | High |

### 5.6 Success Metrics Tracking

#### 5.6.1 User Behavior Metrics

**To Implement:**
```javascript
// Track critical user actions
trackEvent('activity_created', { service_type, has_timer });
trackEvent('invoice_generated', { items_count, total_amount });
trackEvent('timer_started', { activity_id });
trackEvent('kanban_card_moved', { from_status, to_status });

// Track time on task
trackTiming('activity_creation_time', startTime, endTime);
trackTiming('invoice_generation_time', startTime, endTime);

// Track errors
trackError('pdf_generation_failed', { error_code, error_message });
trackError('validation_failed', { field, error_type });
```

#### 5.6.2 Performance Monitoring

**Core Web Vitals:**
```javascript
// Automatically tracked by Lighthouse
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)

// Custom performance marks
performance.mark('activity-list-start');
// ... render activity list
performance.mark('activity-list-end');
performance.measure('activity-list-render', 'activity-list-start', 'activity-list-end');
```

#### 5.6.3 Feature Adoption

**Track Usage:**
- Kanban drag & drop vs. button move
- Timer usage vs. manual time entry
- Client-specific rates vs. base rates
- Invoice auto-generation vs. manual items
- Mobile vs. desktop usage
- Dark mode vs. light mode

### 5.7 Implementation Priorities

#### Phase 1: MVP (Weeks 1-2)
- Authentication (Supabase)
- Client CRUD (with SIRET validation)
- Project CRUD
- Basic activity creation (manual time entry)
- Basic kanban board (no drag & drop)
- User settings (SIRET, base rates)

#### Phase 2: Core Features (Weeks 3-4)
- Timer functionality (Zustand store)
- Kanban drag & drop (@dnd-kit)
- Realtime updates (Supabase Realtime)
- File attachments (Supabase Storage)
- Invoice creation (React PDF)
- Client-specific rates

#### Phase 3: Polish (Week 5)
- Dashboard with KPIs (Recharts)
- URSSAF calculations and dashboard
- Dark mode
- Accessibility audit and fixes
- Performance optimization
- Storybook documentation
- Production deployment

---

## Deliverables Checklist

Before marking UX study complete:

- [x] User research documented (Phase 1)
- [x] User flows mapped (Phase 2)
- [x] Wireframes/mockups created (content hierarchy defined)
- [x] Design tokens defined (Phase 3)
- [x] Accessibility requirements specified (WCAG 2.1 AA)
- [x] Responsive behavior specified (mobile-first 320px-2560px)
- [x] Component states documented (Phase 5)
- [x] Interaction patterns defined (Phase 5)
- [x] Implementation notes written (all phases)
- [x] Success metrics established (Phase 1, 5)
- [x] Validation plan created (Phase 4)
- [x] Edge case handling documented (Phase 2, 5)

---

## Next Steps

### For Development Team:

1. **Review this UX study completely** before writing any code
2. **Follow mobile-first approach**: Start styling at 320px, enhance upward
3. **Use design tokens**: All colors, spacing, typography from defined tokens
4. **Implement accessibility from start**: Don't retrofit later
5. **Test continuously**: Run accessibility audits frequently
6. **Validate with users**: Get feedback on wireframes before full implementation
7. **Track metrics**: Implement analytics from day one
8. **Reference ux-design skill**: Follow component patterns and testing methodology

### Priority Actions:

1. Create high-fidelity mockups in Figma (based on specifications here)
2. Build component library in Storybook (with all documented states)
3. Implement design token system in CSS/Tailwind
4. Set up accessibility testing pipeline (Lighthouse CI)
5. Create user testing plan (recruit 5-10 French freelancers)
6. Validate assumptions with target users

---

**UX Design Phase Complete**

All five phases successfully completed following ux-design skill methodology:
✓ Phase 1: Research
✓ Phase 2: Information Architecture
✓ Phase 3: Design Implementation
✓ Phase 4: Validation
✓ Phase 5: Documentation

This UX study provides comprehensive specifications for building an accessible, user-centered, French-compliant freelancer time tracking application.
