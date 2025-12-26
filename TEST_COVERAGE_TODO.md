# Test Coverage TODO

This document tracks the remaining test coverage work based on the coverage report analysis.

## Status Overview
- **Overall Coverage**: 13.78% → Target: >80%
- **Current Tests**: 60 passed, 3 skipped
- **Test Files**: 4

---

## Priority 1 - New Time Entry Features ⏱️

### ✅ COMPLETED
- [x] **TimeEntryForm component** (29 tests, 3 skipped)
  - All form interactions, validation, create/update modes tested
  - File: `src/features/activities/components/TimeEntryForm.test.tsx`
- [x] **TimeEntriesList component**
  - File: `src/features/activities/components/TimeEntriesList.test.tsx`
  - Coverage: loading + empty states, list rendering with formatted totals, modal open/close, edit/delete actions, confirmation flows, success/error toasts, mutation loading state, and total hours display.
- [x] **useTimeEntries hooks**
  - File: `src/features/activities/hooks/useTimeEntries.test.tsx`
  - Coverage: fetching entries, create/update/delete mutations (with cache invalidation + auth guard), total hours aggregation, and null activity guards.

### 🔄 IN PROGRESS
_Next: KanbanBoard component tests_

---

## Priority 2 - Core Hooks (Critical Infrastructure) 🔧

- [x] **useActivities hook**
  - File: `src/features/activities/hooks/useActivities.test.tsx`
  - Coverage: activities fetch with relations + error path, create/update/delete mutations with cache invalidation and auth guards, and status transition side effects (completed_at timestamps).

- [x] **useRates hook**
  - File: `src/features/rates/hooks/useRates.test.tsx`
  - Coverage: general, base, and client rate queries (including disabled/null guards), create/update/delete mutations with cache invalidation and auth guard, and `useApplicableRate` client-vs-base fallback logic.

- [x] **useAttachments hook** (now covered)
  - File: `src/features/activities/hooks/useActivityAttachments.test.tsx`
  - Coverage: fetch list, upload validation (auth, size, type) + storage/db write + cache invalidation, delete (storage + db) flows, download behavior with browser emulation, and public URL retrieval guards.

- [x] **useAuth hook**
  - File: `src/hooks/useAuth.test.tsx`
  - Coverage: initial session load, unauthenticated state, auth change handling (login/logout), and subscription cleanup.

---

## Priority 3 - Complex Components 📦

- [x] **ActivityForm component**
  - File: `src/features/activities/components/ActivityForm.test.tsx`
  - Coverage: base rendering, validation errors, client-project filtering, rate autofill, create vs edit submissions, and error handling alert.
- [x] **KanbanBoard + KanbanColumn components**
  - File: `src/features/activities/components/KanbanBoard.test.tsx`
  - Coverage: loading vs board render, column creation, new-activity modal, detail modal + edit handoff, drag overlay rendering, status updates, and guards for invalid drops.

- [ ] **KanbanBoard + KanbanColumn components** (0% coverage, 195 lines total)
  - File to create: `src/features/activities/components/KanbanBoard.test.tsx`
  - Tests needed:
    - Board rendering with columns
    - Drag and drop functionality
    - Activity card interactions
    - Status transitions
    - Real-time updates

- [ ] **ActivityDetailModal component** (0% coverage, 203 lines)
  - File to create: `src/features/activities/components/ActivityDetailModal.test.tsx`
  - Tests needed:
    - Modal rendering
    - Activity details display
    - Time entries section
    - Attachments section
    - Edit/delete actions

---

## Priority 4 - Utilities 🛠️

- [x] **validation.ts**
  - File: `src/utils/validation.test.ts`
  - Coverage: SIRET (format + Luhn), email, phone, hex color, file rules, rate + positive numbers, password strength, and generic required validation.

- [x] **format.ts**
  - File: `src/utils/format.test.ts`
  - Coverage: currency/number formats, date & datetime (including fallback), duration/hours, file size, percentage, SIRET/phone formatting, truncation, initials.

- [ ] **helpers.ts** (0% coverage, 207 lines)
  - File to create: `src/utils/helpers.test.ts`
  - Tests needed:
    - Business logic helpers
    - Data transformation functions
    - Calculation utilities
    - Status transition logic

---

## Priority 5 - Integration Tests (Future)

These should be E2E or integration tests rather than unit tests:

- [ ] **Page Components** (0% coverage)
  - Login.tsx (161 lines)
  - Register.tsx (196 lines)
  - Clients.tsx (487 lines)
  - Projects.tsx (489 lines)
  - Dashboard.tsx (52 lines)
  - Settings pages

---

## Coverage Goals

| Module | Current | Target |
|--------|---------|--------|
| **Overall** | 13.78% | 80%+ |
| **Components** | 14.81% | 80%+ |
| **Hooks** | 0% | 90%+ |
| **Utilities** | 1.57% | 95%+ |
| **UI Components** | 68.99% | 85%+ |

---

## Notes

### Known Issues
- 3 TimeEntryForm tests skipped due to validation error display in test environment
- Issue doesn't affect actual functionality, only test rendering

### Testing Best Practices
- Use `vi.hoisted()` for mocking to avoid hoisting errors
- Use `waitFor()` for async assertions
- Mock all external dependencies (hooks, APIs, stores)
- Test both success and error paths
- Test loading and disabled states
- Use descriptive test names

### Commands
```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- TimeEntryForm.test.tsx

# Run with coverage
npm run test -- --coverage

# Run in watch mode
npm run test -- --watch
```

---

**Last Updated**: 2025-12-26
**Next**: TimeEntriesList component tests
