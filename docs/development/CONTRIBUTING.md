# Contributing to Freelancer Time Tracker

First off, thank you for considering contributing to Freelancer Time Tracker! It's people like you that make this tool better for the French freelancer community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account (for testing)
- Familiarity with React, TypeScript, and PostgreSQL

### Setting Up Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/freelancer-time-tracker.git
   cd freelancer-time-tracker
   ```

3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/original/freelancer-time-tracker.git
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

6. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the schema from `docs/PRD-COMPLETE.md`
   - Add your credentials to `.env.local`

7. Start development server:
   ```bash
   npm run dev
   ```

For more details, see [SETUP.md](./docs/SETUP.md).

## Development Process

### Branching Strategy

We use **Git Flow** branching model:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes
- `release/*` - Release preparation

### Creating a Feature Branch

```bash
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name
```

### Working on Your Feature

1. Make your changes
2. Write/update tests
3. Update documentation
4. Ensure all tests pass
5. Commit your changes (see commit guidelines below)

### Keeping Your Branch Updated

```bash
git checkout develop
git pull upstream develop
git checkout feature/your-feature-name
git rebase develop
```

## Coding Standards

### TypeScript

- **Always use TypeScript** - No `.js` or `.jsx` files
- **Strict mode enabled** - Fix all type errors
- **Use type inference** where possible
- **Avoid `any`** - Use proper types or `unknown`
- **Export types** from feature modules

Example:
```typescript
// Good
interface ClientFormData {
  name: string;
  email?: string;
  siret: string;
}

export function ClientForm({ onSubmit }: { onSubmit: (data: ClientFormData) => void }) {
  // ...
}

// Bad
export function ClientForm({ onSubmit }: any) {
  // ...
}
```

### React Components

- **Functional components only** - No class components
- **Use hooks** - Follow Rules of Hooks
- **Named exports** for components
- **Props interface** defined above component
- **Component file structure**:
  ```typescript
  // 1. Imports
  import { useState } from 'react';

  // 2. Types
  interface MyComponentProps {
    title: string;
  }

  // 3. Component
  export function MyComponent({ title }: MyComponentProps) {
    // ...
  }
  ```

### File Organization

- **Feature-based structure** - Group by feature, not by type
- **Index files** - Use for clean imports
- **Naming conventions**:
  - Components: `PascalCase.tsx`
  - Hooks: `useCamelCase.ts`
  - Utils: `camelCase.ts`
  - Types: `types.ts` or `*.types.ts`
  - Constants: `UPPER_SNAKE_CASE`

### Styling

- **Tailwind CSS** - Use utility classes
- **shadcn/ui components** - Leverage existing components
- **CSS variables** - For theme colors
- **No inline styles** - Use Tailwind classes
- **Responsive design** - Mobile-first approach

Example:
```tsx
// Good
<div className="flex items-center gap-4 p-6 bg-card rounded-lg shadow-md">
  <h2 className="text-2xl font-bold text-foreground">Title</h2>
</div>

// Bad
<div style={{ display: 'flex', padding: '24px' }}>
  <h2 style={{ fontSize: '24px' }}>Title</h2>
</div>
```

### State Management

- **TanStack Query** - For server state
- **Zustand** - For global UI state
- **Local state** - Use `useState` when possible
- **No prop drilling** - Use context or Zustand for deep state

### Database & Supabase

- **Always use RLS** - Row Level Security on all tables
- **Type-safe queries** - Use generated types
- **Error handling** - Always handle Supabase errors
- **No SQL injection** - Use parameterized queries

Example:
```typescript
// Good
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .eq('id', clientId)
  .single();

if (error) throw error;

// Bad
const { data } = await supabase
  .from('clients')
  .select('*')
  .eq('id', clientId)
  .single();
// Missing error handling
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, missing semicolons)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding/updating tests
- `chore` - Build process, dependencies, tooling

### Examples

```bash
# Feature
git commit -m "feat(invoices): add PDF generation with French legal mentions"

# Bug fix
git commit -m "fix(kanban): prevent invalid state transitions"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactor
git commit -m "refactor(auth): simplify login flow with custom hook"
```

### Commit Body (Optional)

```
feat(urssaf): add CA threshold alerts

Add visual alerts when revenue approaches TVA threshold (37,500€)
and annual plafond (77,700€). Shows warning at 90% threshold.

Closes #42
```

## Pull Request Process

### Before Submitting

1. **Update from upstream**:
   ```bash
   git pull upstream develop
   git rebase develop
   ```

2. **Run all checks**:
   ```bash
   npm run lint
   npm run typecheck
   npm run test
   npm run build
   ```

3. **Update documentation** if needed

4. **Test manually** in development environment

### Creating the Pull Request

1. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Open PR on GitHub against `develop` branch

3. Fill out the PR template:
   - **Description** - What does this PR do?
   - **Type** - Feature, bugfix, docs, etc.
   - **Related issues** - Link to issues
   - **Screenshots** - For UI changes
   - **Testing** - How to test this PR
   - **Checklist** - Mark completed items

### PR Template Example

```markdown
## Description
Adds PDF generation for invoices with French legal mentions as per Article 293 B.

## Type
- [x] Feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Refactor

## Related Issues
Closes #42

## Screenshots
[Attach invoice PDF screenshot]

## Testing
1. Create a new invoice
2. Click "Generate PDF"
3. Verify all legal mentions are present
4. Check SIRET formatting

## Checklist
- [x] Code follows style guidelines
- [x] Tests added/updated
- [x] Documentation updated
- [x] No TypeScript errors
- [x] All tests pass
```

### Review Process

- At least **1 reviewer approval** required
- All **CI checks** must pass
- **No merge conflicts** with develop
- **Documentation updated** if needed

### After Approval

- Squash and merge (preferred) or rebase
- Delete your branch after merge
- Update your local repository:
  ```bash
  git checkout develop
  git pull upstream develop
  ```

## Testing Requirements

### Unit Tests

- **Required** for all utility functions
- **Required** for custom hooks
- Use **Vitest** and **React Testing Library**

Example:
```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency } from './utils';

describe('formatCurrency', () => {
  it('formats euros correctly', () => {
    expect(formatCurrency(1234.56)).toBe('1 234,56 €');
  });
});
```

### Component Tests

- **Required** for complex components
- Test user interactions
- Test edge cases

Example:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ClientForm } from './ClientForm';

describe('ClientForm', () => {
  it('validates SIRET format', async () => {
    render(<ClientForm onSubmit={vi.fn()} />);

    const siretInput = screen.getByLabelText(/siret/i);
    fireEvent.change(siretInput, { target: { value: '12345' } });

    expect(screen.getByText(/14 dígitos/i)).toBeInTheDocument();
  });
});
```

### Integration Tests

- **Recommended** for critical flows
- Test feature end-to-end
- Mock Supabase calls

### Test Coverage

- Aim for **80%+ coverage**
- Required for core business logic
- Check coverage: `npm run test:coverage`

## Documentation

### Code Comments

- **Explain WHY**, not what
- Use JSDoc for public APIs
- Keep comments up to date

```typescript
/**
 * Calculates URSSAF social contributions for a given revenue amount.
 * Uses the 2025 rate of 24.6% for BNC (Bénéfices Non Commerciaux).
 *
 * @param revenue - Monthly revenue in euros
 * @returns Contribution amount in euros
 */
export function calculateURSSAF(revenue: number): number {
  return revenue * 0.246;
}
```

### README Updates

- Update README if you add:
  - New features
  - New dependencies
  - New environment variables
  - New scripts

### Documentation Files

- Update `/docs` files when relevant
- Keep PRD-COMPLETE.md as source of truth
- Add to TROUBLESHOOTING.md for common issues

## Questions?

- **GitHub Discussions** - For general questions
- **GitHub Issues** - For bugs and feature requests
- **Email** - contact@yourproject.com

## Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes
- Project website (when available)

---

Thank you for contributing to Freelancer Time Tracker!
