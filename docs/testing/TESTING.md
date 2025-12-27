# Testing Strategy and Guidelines

Comprehensive testing guide for Freelancer Time Tracker covering unit tests, integration tests, and end-to-end testing.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Testing Stack](#testing-stack)
- [Test Structure](#test-structure)
- [Unit Testing](#unit-testing)
- [Component Testing](#component-testing)
- [Integration Testing](#integration-testing)
- [E2E Testing](#e2e-testing)
- [Test Coverage](#test-coverage)
- [Best Practices](#best-practices)

## Testing Philosophy

### Testing Pyramid

```
         /\
        /E2E\         ← Few, critical user flows
       /------\
      /  Int.  \      ← Feature integration tests
     /----------\
    /   Unit     \    ← Many, fast, isolated tests
   /--------------\
```

### Principles

1. **Fast Feedback** - Tests should run quickly
2. **Reliable** - No flaky tests
3. **Maintainable** - Tests should be easy to understand
4. **Isolated** - Tests should not depend on each other
5. **Realistic** - Test real user scenarios

### Coverage Goals

- **Overall**: 80%+
- **Business logic**: 90%+
- **Utilities**: 95%+
- **UI components**: 70%+

## Testing Stack

### Tools

- **Vitest** - Test runner (Vite-native, fast)
- **React Testing Library** - Component testing
- **MSW** (Mock Service Worker) - API mocking
- **Playwright** - E2E testing (optional)

### Installation

```bash
npm install -D vitest @vitest/ui
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D msw
npm install -D @playwright/test
```

### Configuration

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'src/main.tsx',
      ],
    },
  },
});
```

**src/test/setup.ts**:
```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

## Test Structure

### Directory Organization

```
src/
├── features/
│   └── clients/
│       ├── components/
│       │   ├── ClientForm.tsx
│       │   └── ClientForm.test.tsx
│       ├── hooks/
│       │   ├── useClients.ts
│       │   └── useClients.test.ts
│       └── utils/
│           ├── validation.ts
│           └── validation.test.ts
├── lib/
│   ├── utils.ts
│   └── utils.test.ts
└── test/
    ├── setup.ts
    ├── helpers.tsx
    └── mocks/
        ├── handlers.ts
        └── data.ts
```

### Naming Conventions

- Test files: `*.test.ts` or `*.test.tsx`
- Test utilities: `test/helpers.tsx`
- Mock data: `test/mocks/data.ts`
- MSW handlers: `test/mocks/handlers.ts`

## Unit Testing

### Testing Utilities

**src/lib/utils.test.ts**:
```typescript
import { describe, it, expect } from 'vitest';
import { formatCurrency, validateSIRET } from './utils';

describe('formatCurrency', () => {
  it('formats euros correctly', () => {
    expect(formatCurrency(1234.56)).toBe('1 234,56 €');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('0,00 €');
  });

  it('handles negative numbers', () => {
    expect(formatCurrency(-100)).toBe('-100,00 €');
  });
});

describe('validateSIRET', () => {
  it('accepts valid 14-digit SIRET', () => {
    expect(validateSIRET('12345678901234')).toBe(true);
  });

  it('rejects invalid length', () => {
    expect(validateSIRET('123')).toBe(false);
  });

  it('rejects non-numeric', () => {
    expect(validateSIRET('1234567890abcd')).toBe(false);
  });

  it('accepts empty as optional', () => {
    expect(validateSIRET('', true)).toBe(true);
  });
});
```

### Testing Business Logic

**src/features/urssaf/utils/calculations.test.ts**:
```typescript
import { describe, it, expect } from 'vitest';
import {
  calculateCotisations,
  calculatePlafondPercentage,
  shouldAlertTVA,
} from './calculations';

describe('URSSAF calculations', () => {
  describe('calculateCotisations', () => {
    it('calculates 24.6% for 2025', () => {
      const revenue = 10000;
      const cotisations = calculateCotisations(revenue);
      expect(cotisations).toBe(2460);
    });

    it('handles zero revenue', () => {
      expect(calculateCotisations(0)).toBe(0);
    });

    it('rounds to 2 decimals', () => {
      expect(calculateCotisations(100.123)).toBe(24.63);
    });
  });

  describe('calculatePlafondPercentage', () => {
    it('calculates percentage vs 77700€ plafond', () => {
      expect(calculatePlafondPercentage(38850)).toBe(50);
      expect(calculatePlafondPercentage(77700)).toBe(100);
    });
  });

  describe('shouldAlertTVA', () => {
    it('alerts when revenue exceeds 37500€', () => {
      expect(shouldAlertTVA(40000)).toBe(true);
      expect(shouldAlertTVA(30000)).toBe(false);
      expect(shouldAlertTVA(37500)).toBe(false); // Exact threshold
      expect(shouldAlertTVA(37501)).toBe(true);
    });
  });
});
```

### Testing Custom Hooks

**src/hooks/useDebounce.test.ts**:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  it('debounces value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 500 });

    // Value should still be old immediately
    expect(result.current).toBe('initial');

    // Wait for debounce
    await waitFor(
      () => {
        expect(result.current).toBe('updated');
      },
      { timeout: 600 }
    );
  });
});
```

## Component Testing

### Testing Forms

**src/features/clients/components/ClientForm.test.tsx**:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientForm } from './ClientForm';

describe('ClientForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders all required fields', () => {
    render(<ClientForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/nom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/siret/i)).toBeInTheDocument();
  });

  it('validates SIRET format', async () => {
    const user = userEvent.setup();
    render(<ClientForm onSubmit={mockOnSubmit} />);

    const siretInput = screen.getByLabelText(/siret/i);
    await user.type(siretInput, '12345');
    await user.tab(); // Trigger blur

    await waitFor(() => {
      expect(screen.getByText(/14 dígitos/i)).toBeInTheDocument();
    });
  });

  it('submits valid data', async () => {
    const user = userEvent.setup();
    render(<ClientForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/nom/i), 'Test Client');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/siret/i), '12345678901234');

    await user.click(screen.getByRole('button', { name: /enregistrer/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Test Client',
        email: 'test@example.com',
        siret: '12345678901234',
      });
    });
  });

  it('displays server errors', async () => {
    const mockOnSubmitWithError = vi.fn().mockRejectedValue(
      new Error('SIRET already exists')
    );

    render(<ClientForm onSubmit={mockOnSubmitWithError} />);

    // Fill and submit form
    // ...

    await waitFor(() => {
      expect(screen.getByText(/siret already exists/i)).toBeInTheDocument();
    });
  });
});
```

### Testing Interactive Components

**src/features/activities/components/KanbanColumn.test.tsx**:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';

const mockActivities = [
  {
    id: '1',
    title: 'Task 1',
    status: 'en_curso',
    // ... other fields
  },
  {
    id: '2',
    title: 'Task 2',
    status: 'en_curso',
  },
];

describe('KanbanColumn', () => {
  it('renders column title and count', () => {
    render(
      <DndContext>
        <KanbanColumn
          status="en_curso"
          title="En Curso"
          activities={mockActivities}
        />
      </DndContext>
    );

    expect(screen.getByText('En Curso')).toBeInTheDocument();
    expect(screen.getByText(/2 tareas/i)).toBeInTheDocument();
  });

  it('renders all activity cards', () => {
    render(
      <DndContext>
        <KanbanColumn
          status="en_curso"
          title="En Curso"
          activities={mockActivities}
        />
      </DndContext>
    );

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });
});
```

### Test Helpers

**src/test/helpers.tsx**:
```typescript
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Create a custom render function
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

export * from '@testing-library/react';
```

## Integration Testing

### Testing with MSW

**src/test/mocks/handlers.ts**:
```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  // GET clients
  http.get('/rest/v1/clients', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Client 1',
        email: 'client1@example.com',
        siret: '12345678901234',
      },
      {
        id: '2',
        name: 'Client 2',
        email: 'client2@example.com',
        siret: '98765432109876',
      },
    ]);
  }),

  // POST client
  http.post('/rest/v1/clients', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: '3',
      ...body,
      created_at: new Date().toISOString(),
    });
  }),

  // Handle errors
  http.delete('/rest/v1/clients/:id', () => {
    return HttpResponse.json(
      { error: 'Cannot delete client with active projects' },
      { status: 400 }
    );
  }),
];
```

**src/test/mocks/server.ts**:
```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

**src/test/setup.ts** (updated):
```typescript
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());
```

### Testing Data Fetching

**src/features/clients/hooks/useClients.test.ts**:
```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useClients } from './useClients';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useClients', () => {
  it('fetches clients successfully', async () => {
    const { result } = renderHook(() => useClients(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for data
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0].name).toBe('Client 1');
  });
});
```

## E2E Testing

### Playwright Setup

**playwright.config.ts**:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Example

**e2e/invoice-flow.spec.ts**:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Invoice Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('creates invoice from activities', async ({ page }) => {
    // Navigate to invoices
    await page.click('text=Factures');
    await expect(page).toHaveURL('/invoices');

    // Click new invoice
    await page.click('text=Nouvelle facture');

    // Select client
    await page.click('[data-testid="client-select"]');
    await page.click('text=Client Test');

    // Select activities
    await page.check('[data-testid="activity-1"]');
    await page.check('[data-testid="activity-2"]');

    // Verify total calculated
    await expect(page.locator('[data-testid="total"]')).toContainText('500,00 €');

    // Submit
    await page.click('button:has-text("Créer facture")');

    // Verify success
    await expect(page.locator('.toast')).toContainText('Facture créée');
    await expect(page).toHaveURL(/\/invoices\/\w+/);
  });
});
```

## Test Coverage

### Running Coverage

```bash
# Run tests with coverage
npm run test:coverage

# View coverage report
open coverage/index.html
```

### Coverage Configuration

**vitest.config.ts**:
```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
```

## Best Practices

### Do's

✅ **Test behavior, not implementation**
```typescript
// Good - tests user behavior
expect(screen.getByText(/client créé/i)).toBeInTheDocument();

// Bad - tests implementation details
expect(component.state.clients).toHaveLength(1);
```

✅ **Use Testing Library queries correctly**
```typescript
// Prefer accessible queries
screen.getByRole('button', { name: /soumettre/i });
screen.getByLabelText(/email/i);

// Avoid test IDs unless necessary
screen.getByTestId('submit-button'); // Last resort
```

✅ **Test edge cases**
```typescript
it('handles empty string', () => { /* ... */ });
it('handles very long input', () => { /* ... */ });
it('handles special characters', () => { /* ... */ });
```

✅ **Use descriptive test names**
```typescript
// Good
it('displays validation error when SIRET is invalid', () => {});

// Bad
it('test SIRET', () => {});
```

### Don'ts

❌ **Don't test third-party libraries**
❌ **Don't test styling** (use visual regression for that)
❌ **Don't make tests depend on each other**
❌ **Don't use real API calls** (use MSW)
❌ **Don't skip error cases**

## Commands

```bash
# Run all tests
npm run test

# Run in watch mode
npm run test:watch

# Run with UI
npm run test:ui

# Run coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E in UI mode
npm run test:e2e:ui
```

## CI Integration

**GitHub Actions** (.github/workflows/test.yml):
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

**Write tests, ship with confidence**
