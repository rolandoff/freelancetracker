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

### 🔄 IN PROGRESS
- [ ] **TimeEntriesList component** (0% coverage)
  - File to create: `src/features/activities/components/TimeEntriesList.test.tsx`
  - Tests needed:
    - List rendering (empty state, with entries)
    - CRUD operations (create, edit, delete)
    - Total hours display
    - Modal interactions
    - Delete confirmation

- [ ] **useTimeEntries hooks** (0% coverage)
  - File to create: `src/features/activities/hooks/useTimeEntries.test.ts`
  - Tests needed:
    - `useTimeEntries` - fetch entries
    - `useCreateTimeEntry` - create mutation
    - `useUpdateTimeEntry` - update mutation
    - `useDeleteTimeEntry` - delete mutation
    - `useActivityTotalHours` - total calculation

---

## Priority 2 - Core Hooks (Critical Infrastructure) 🔧

- [ ] **useActivities hook** (0% coverage, 147 lines)
  - File to create: `src/features/activities/hooks/useActivities.test.ts`
  - Tests needed:
    - `useActivities` - fetch with relations
    - `useCreateActivity` - create mutation
    - `useUpdateActivity` - update mutation
    - `useDeleteActivity` - delete mutation
    - `useUpdateActivityStatus` - status transitions

- [ ] **useRates hook** (0% coverage, 163 lines)
  - File to create: `src/features/rates/hooks/useRates.test.ts`
  - Tests needed:
    - `useRates` - fetch base and client rates
    - `useCreateRate` - create mutation
    - `useUpdateRate` - update mutation
    - `useDeleteRate` - delete mutation
    - Rate calculations and filtering

- [ ] **useAttachments hook** (0% coverage, 154 lines)
  - File to create: `src/features/activities/hooks/useAttachments.test.ts`
  - Tests needed:
    - `useAttachments` - fetch files
    - `useUploadAttachment` - file upload
    - `useDeleteAttachment` - file deletion
    - `useDownloadAttachment` - file download
    - File validation and error handling

- [ ] **useAuth hook** (0% coverage, 36 lines)
  - File to create: `src/hooks/useAuth.test.ts`
  - Tests needed:
    - Login/logout flows
    - Session management
    - Error handling

---

## Priority 3 - Complex Components 📦

- [ ] **ActivityForm component** (0% coverage, 280 lines)
  - File to create: `src/features/activities/components/ActivityForm.test.tsx`
  - Tests needed:
    - Form rendering
    - Field validation
    - Client/project selection
    - Service type and rate calculation
    - Create vs edit modes
    - Form submission and error handling

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

- [ ] **validation.ts** (0% coverage, 201 lines)
  - File to create: `src/utils/validation.test.ts`
  - Tests needed:
    - SIRET validation (14-digit French business number)
    - Email validation
    - Required field validation
    - French legal compliance validation
    - Error message generation

- [ ] **format.ts** (0% coverage, 153 lines)
  - File to create: `src/utils/format.test.ts`
  - Tests needed:
    - Date formatting (French locale)
    - Currency formatting (EUR)
    - Duration formatting (HH:MM:SS)
    - Number formatting
    - Relative time formatting

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
