# E2E Test Plan - Freelancer Time Tracker

## Overview

This document outlines the End-to-End (E2E) testing needs for scenarios that are too complex for unit/integration tests with mocked dependencies. These tests should be implemented using Playwright or Cypress.

## Why E2E for These Scenarios?

The following pages use inline TanStack Query hooks with complex state management that's difficult to mock reliably:
- **Clients.tsx**: Direct `useQuery` and `useMutation` calls with inline query functions
- **Projects.tsx**: Similar inline query pattern with client filtering
- **Complex form flows**: Multi-step validation with async operations

Unit tests for these become fragile and require extensive mocking that doesn't reflect real behavior.

## Priority E2E Test Scenarios

### 1. Client Management Flow (High Priority)

**Path**: `/clients`

**Scenarios**:
1. **Create Client**
   - Click "Nouveau client" button
   - Fill form with valid data (name, email, SIRET, address)
   - Validate SIRET format (14 digits)
   - Submit and verify toast success message
   - Verify client appears in table

2. **Edit Client**
   - Click "Modifier" on existing client
   - Update client information
   - Submit and verify changes reflected in table

3. **Toggle Active/Inactive Status**
   - Click "Désactiver" on active client
   - Verify status badge changes to "Inactif"
   - Toggle "Afficher les clients inactifs" checkbox
   - Verify inactive client appears

4. **Form Validation**
   - Try to submit form without required name
   - Verify error message "Le nom est requis"
   - Enter invalid email format
   - Verify email validation error
   - Enter invalid SIRET (not 14 digits)
   - Verify SIRET validation error

### 2. Project Management Flow (High Priority)

**Path**: `/projects`

**Scenarios**:
1. **Create Project**
   - Click "Nouveau projet" button
   - Select client from dropdown
   - Enter project name and select color
   - Submit and verify project in table

2. **Filter Projects by Client**
   - Use client filter dropdown
   - Verify only projects for selected client display

3. **Archive/Restore Project**
   - Click "Archiver" on active project
   - Verify project removed from active list
   - Toggle "Afficher les projets archivés"
   - Verify archived project appears
   - Click "Restaurer" and verify project returns to active

### 3. Settings Pages (Medium Priority)

**Path**: `/settings/*`

**Scenarios**:
1. **Profile Settings**
   - Navigate to Settings → Profile
   - Update company name and SIRET
   - Submit and verify success toast
   - Refresh page and verify data persisted

2. **Legal Settings**
   - Toggle TVA applicable checkbox
   - Update cotisations rate
   - Submit and verify saved

### 4. Kanban Workflow (High Priority)

**Path**: `/activities`

**Scenarios**:
1. **Create Activity**
   - Click "Nouvelle activité"
   - Select client, project, service type
   - Enter description and hours
   - Submit and verify card appears in "Por Validar" column

2. **Drag and Drop**
   - Drag activity card from "Por Validar" to "En Curso"
   - Verify status transition
   - Verify real-time update (if using Supabase Realtime)

3. **Add Time Entry**
   - Open activity detail modal
   - Click "Ajouter une entrée"
   - Enter start/end time or duration
   - Submit and verify entry in list
   - Verify total hours updated

4. **File Attachments**
   - Open activity modal
   - Upload file (PDF, image, etc.)
   - Verify file appears in attachments list
   - Download file and verify content
   - Delete file and verify removal

### 5. Invoice Creation Flow (High Priority)

**Path**: `/invoices/new`

**Scenarios**:
1. **Create Invoice from Activities**
   - Navigate to invoice creation
   - Select client
   - See list of "por_facturar" activities
   - Select activities to invoice
   - Verify totals calculated automatically
   - Add manual invoice item
   - Apply discount
   - Submit and verify invoice created

2. **Generate PDF**
   - Open created invoice
   - Click "Télécharger PDF"
   - Verify PDF downloads with correct data
   - Verify legal mentions present (Article 293 B CGI)

3. **Mark as Paid**
   - Open invoice in "en_espera_pago" status
   - Click "Marquer comme payée"
   - Verify invoice status changes to "pagada"
   - Verify linked activities status changes to "facturada"

### 6. Dashboard (Medium Priority)

**Path**: `/dashboard`

**Scenarios**:
1. **Verify Real KPIs**
   - Create test invoice and mark as paid
   - Navigate to dashboard
   - Verify monthly revenue reflects paid invoice
   - Verify URSSAF calculations display correctly
   - Verify progress bars show CA vs plafond

2. **Quick Actions**
   - Click "Nouvelle activité" quick action
   - Verify redirects to activity creation
   - Click "Nouvelle facture" 
   - Verify redirects to invoice creation

## Test Data Setup

For consistent E2E tests, use the following approach:

1. **Database Reset Between Tests**
   ```sql
   -- Run before each test suite
   DELETE FROM time_entries WHERE user_id = 'test-user-id';
   DELETE FROM activities WHERE user_id = 'test-user-id';
   DELETE FROM invoices WHERE user_id = 'test-user-id';
   DELETE FROM projects WHERE user_id = 'test-user-id';
   DELETE FROM clients WHERE user_id = 'test-user-id';
   DELETE FROM rates WHERE user_id = 'test-user-id';
   ```

2. **Seed Test Data**
   - Create test user via Supabase Auth
   - Seed 2-3 test clients with valid SIRET numbers
   - Create 3-4 test projects linked to clients
   - Create sample activities in various statuses
   - Create test rates for different service types

## Implementation Recommendations

### Playwright Setup (Recommended)

```bash
npm install -D @playwright/test
npx playwright install
```

**playwright.config.ts**:
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Sequential for database state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid race conditions
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Example Test Structure

```typescript
// e2e/clients.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Client Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
    
    // Navigate to clients
    await page.goto('/clients');
  });

  test('should create new client', async ({ page }) => {
    await page.click('text=Nouveau client');
    await page.fill('[name="name"]', 'Test Client SARL');
    await page.fill('[name="email"]', 'test@client.com');
    await page.fill('[name="siret"]', '12345678901234');
    await page.click('button:has-text("Créer")');
    
    await expect(page.locator('text=Client créé')).toBeVisible();
    await expect(page.locator('text=Test Client SARL')).toBeVisible();
  });
});
```

## Coverage Goals

- **Critical Path**: 100% (auth, create client/project/activity, invoice creation)
- **Happy Paths**: 100% (all CRUD operations work correctly)
- **Error Handling**: 80% (form validation, API errors)
- **Edge Cases**: 60% (complex state transitions, concurrent updates)

## Maintenance

- Run E2E tests on every PR to main branch
- Run full suite nightly with test database
- Update tests when UI changes significantly
- Keep test data seeds up to date with schema changes

## CI/CD Integration

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
        env:
          VITE_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_KEY }}
```

---

**Note**: Unit tests should continue to cover isolated logic (utilities, hooks with mocked deps, simple components). E2E tests complement them by validating real user workflows end-to-end.
