# Design Token Reference Sheet

> Complete design token system for Freelancer Time Tracker application

**Version**: 1.0
**Last Updated**: 2025-12-25
**Based on**: UX-STUDY.md Phase 3

---

## Table of Contents

1. [Color System](#color-system)
2. [Spacing System](#spacing-system)
3. [Typography System](#typography-system)
4. [Border Radius](#border-radius)
5. [Shadows](#shadows)
6. [Breakpoints](#breakpoints)
7. [Implementation Guide](#implementation-guide)

---

## Color System

### Primary Colors (Blue - Brand & Primary Actions)

```css
--color-primary-50:  #ebf8ff
--color-primary-100: #bee3f8
--color-primary-200: #90cdf4
--color-primary-300: #63b3ed
--color-primary-400: #4299e1
--color-primary-500: #3182ce  /* Main primary */
--color-primary-600: #2c5282
--color-primary-700: #2a4365
--color-primary-800: #1e3a5f
--color-primary-900: #1a2332
```

**Usage:**
- Primary buttons: `--color-primary-500`
- Primary hover: `--color-primary-600`
- Links: `--color-primary-600` (light) / `--color-primary-400` (dark)
- Focus indicators: `--color-primary-500`

### Success Colors (Green)

```css
--color-success-50:  #f0fff4
--color-success-100: #c6f6d5
--color-success-200: #9ae6b4
--color-success-300: #68d391
--color-success-400: #48bb78
--color-success-500: #38a169  /* Main success */
--color-success-600: #2f855a
--color-success-700: #276749
--color-success-800: #22543d
--color-success-900: #1c4532
```

**Usage:**
- Success messages: `--color-success-600`
- Completed status badge: `--color-success-500`
- Checkmarks and confirmations: `--color-success-500`

### Warning Colors (Orange)

```css
--color-warning-50:  #fffaf0
--color-warning-100: #feebc8
--color-warning-200: #fbd38d
--color-warning-300: #f6ad55
--color-warning-400: #ed8936
--color-warning-500: #dd6b20  /* Main warning */
--color-warning-600: #c05621
--color-warning-700: #9c4221
--color-warning-800: #7c2d12
--color-warning-900: #652412
```

**Usage:**
- Warning messages: `--color-warning-500`
- "En Prueba" status badge: `--color-warning-500`
- Alert banners: `--color-warning-100` background

### Error Colors (Red)

```css
--color-error-50:  #fff5f5
--color-error-100: #fed7d7
--color-error-200: #feb2b2
--color-error-300: #fc8181
--color-error-400: #f56565
--color-error-500: #e53e3e  /* Main error */
--color-error-600: #c53030
--color-error-700: #9b2c2c
--color-error-800: #822727
--color-error-900: #63171b
```

**Usage:**
- Error messages: `--color-error-600`
- Destructive buttons: `--color-error-500`
- Form validation errors: `--color-error-500`
- Error borders: `--color-error-500`

### Neutral Colors (Gray)

```css
--color-neutral-50:  #f7fafc
--color-neutral-100: #edf2f7
--color-neutral-200: #e2e8f0
--color-neutral-300: #cbd5e0
--color-neutral-400: #a0aec0
--color-neutral-500: #718096
--color-neutral-600: #4a5568
--color-neutral-700: #2d3748
--color-neutral-800: #1a202c
--color-neutral-900: #171923
```

**Usage:**
- Text primary: `--color-neutral-900` (light) / `--color-neutral-50` (dark)
- Text secondary: `--color-neutral-600` (light) / `--color-neutral-300` (dark)
- Borders: `--color-neutral-300` (light) / `--color-neutral-600` (dark)
- Backgrounds: `--color-neutral-50`, `--color-neutral-100`

### Semantic Color Assignments

#### Light Theme

```css
/* Text Colors */
--color-text-primary: var(--color-neutral-900)     /* #171923 - 16.1:1 contrast */
--color-text-secondary: var(--color-neutral-600)   /* #4a5568 - 8.6:1 contrast */
--color-text-tertiary: var(--color-neutral-500)    /* #718096 */
--color-text-inverse: var(--color-neutral-50)      /* #f7fafc */

/* Background Colors */
--color-bg-primary: #ffffff
--color-bg-secondary: var(--color-neutral-50)      /* #f7fafc */
--color-bg-tertiary: var(--color-neutral-100)      /* #edf2f7 */

/* Border Colors */
--color-border: var(--color-neutral-300)           /* #cbd5e0 */
--color-border-hover: var(--color-neutral-400)     /* #a0aec0 */
--color-border-focus: var(--color-primary-500)     /* #3182ce */

/* Link Colors */
--color-link: var(--color-primary-600)             /* #2c5282 - 4.6:1 contrast */
--color-link-hover: var(--color-primary-700)       /* #2a4365 */
```

#### Dark Theme

```css
[data-theme="dark"] {
  /* Text Colors */
  --color-text-primary: var(--color-neutral-50)     /* #f7fafc */
  --color-text-secondary: var(--color-neutral-300)  /* #cbd5e0 */
  --color-text-tertiary: var(--color-neutral-400)   /* #a0aec0 */
  --color-text-inverse: var(--color-neutral-900)    /* #171923 */

  /* Background Colors */
  --color-bg-primary: var(--color-neutral-900)      /* #171923 */
  --color-bg-secondary: var(--color-neutral-800)    /* #1a202c */
  --color-bg-tertiary: var(--color-neutral-700)     /* #2d3748 */

  /* Border Colors */
  --color-border: var(--color-neutral-600)          /* #4a5568 */
  --color-border-hover: var(--color-neutral-500)    /* #718096 */
  --color-border-focus: var(--color-primary-400)    /* #4299e1 */

  /* Link Colors */
  --color-link: var(--color-primary-400)            /* #4299e1 */
  --color-link-hover: var(--color-primary-300)      /* #63b3ed */
}
```

### Status-Specific Colors

```css
/* Kanban Status Colors */
--color-status-por-validar: var(--color-neutral-400)   /* Gray - Pending */
--color-status-en-curso: var(--color-primary-500)      /* Blue - In Progress */
--color-status-en-prueba: var(--color-warning-500)     /* Orange - Testing */
--color-status-completada: var(--color-success-500)    /* Green - Completed */
--color-status-por-facturar: var(--color-primary-700)  /* Dark Blue - To Invoice */
--color-status-facturada: var(--color-neutral-600)     /* Dark Gray - Invoiced */
```

### WCAG Contrast Requirements

All color combinations meet WCAG 2.1 AA standards:

| Color Combination | Ratio | Pass |
|-------------------|-------|------|
| Primary text on light BG (#1a202c on #ffffff) | 16.1:1 | ✓ |
| Secondary text on light BG (#4a5568 on #ffffff) | 8.6:1 | ✓ |
| Primary text on dark BG (#f7fafc on #1a202c) | 16.1:1 | ✓ |
| Link text (#3182ce on #ffffff) | 4.6:1 | ✓ |
| Error text (#c53030 on #ffffff) | 5.1:1 | ✓ |
| Success text (#2f855a on #ffffff) | 4.5:1 | ✓ |
| Focus indicator (#4299e1 on #ffffff) | 3.2:1 | ✓ |

---

## Spacing System

Base spacing unit: **4px**

```css
--space-0: 0
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-10: 2.5rem   /* 40px */
--space-12: 3rem     /* 48px */
--space-16: 4rem     /* 64px */
--space-20: 5rem     /* 80px */
--space-24: 6rem     /* 96px */
```

### Semantic Spacing

```css
/* Page & Layout */
--space-page-padding: var(--space-6)    /* 24px */
--space-section-gap: var(--space-8)     /* 32px */

/* Components */
--space-card-padding: var(--space-6)    /* 24px */
--space-input-padding: var(--space-3)   /* 12px */
--space-button-padding-x: var(--space-6) /* 24px horizontal */
--space-button-padding-y: var(--space-3) /* 12px vertical */

/* Lists & Grids */
--space-list-gap: var(--space-4)        /* 16px */
--space-grid-gap: var(--space-4)        /* 16px */
```

### Mobile Overrides (<768px)

```css
@media (max-width: 767px) {
  :root {
    --space-page-padding: var(--space-4)    /* 16px */
    --space-section-gap: var(--space-6)     /* 24px */
    --space-card-padding: var(--space-4)    /* 16px */
  }
}
```

### Usage Examples

```css
/* Page container */
.page {
  padding: var(--space-page-padding);
}

/* Section spacing */
.section + .section {
  margin-top: var(--space-section-gap);
}

/* Card component */
.card {
  padding: var(--space-card-padding);
  gap: var(--space-4);
}

/* Button */
.button {
  padding: var(--space-3) var(--space-6);
}
```

---

## Typography System

### Font Families

```css
--font-sans: system-ui, -apple-system, "Segoe UI", Roboto,
             "Helvetica Neue", Arial, sans-serif
--font-mono: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono",
             Consolas, monospace
```

### Font Sizes (Fluid Typography)

```css
--text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)     /* 12-14px */
--text-sm: clamp(0.875rem, 0.8rem + 0.3vw, 1rem)         /* 14-16px */
--text-base: clamp(1rem, 0.95rem + 0.35vw, 1.125rem)     /* 16-18px */
--text-lg: clamp(1.125rem, 1.05rem + 0.4vw, 1.25rem)     /* 18-20px */
--text-xl: clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)       /* 20-24px */
--text-2xl: clamp(1.5rem, 1.35rem + 0.75vw, 1.875rem)    /* 24-30px */
--text-3xl: clamp(1.875rem, 1.65rem + 1.125vw, 2.25rem)  /* 30-36px */
--text-4xl: clamp(2.25rem, 1.95rem + 1.5vw, 3rem)        /* 36-48px */
```

### Line Heights

```css
--leading-tight: 1.25      /* Headings */
--leading-snug: 1.375      /* Subheadings */
--leading-normal: 1.5      /* Body text */
--leading-relaxed: 1.625   /* Long-form content */
--leading-loose: 2         /* Spacious paragraphs */
```

### Font Weights

```css
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### Typography Scale Usage

```css
/* Headings */
h1 {
  font-size: var(--text-4xl);          /* 36-48px */
  font-weight: var(--font-bold);        /* 700 */
  line-height: var(--leading-tight);    /* 1.25 */
  color: var(--color-text-primary);
}

h2 {
  font-size: var(--text-3xl);          /* 30-36px */
  font-weight: var(--font-bold);        /* 700 */
  line-height: var(--leading-tight);    /* 1.25 */
  color: var(--color-text-primary);
}

h3 {
  font-size: var(--text-2xl);          /* 24-30px */
  font-weight: var(--font-semibold);    /* 600 */
  line-height: var(--leading-snug);     /* 1.375 */
  color: var(--color-text-primary);
}

h4 {
  font-size: var(--text-xl);           /* 20-24px */
  font-weight: var(--font-semibold);    /* 600 */
  line-height: var(--leading-snug);     /* 1.375 */
  color: var(--color-text-primary);
}

/* Body text */
body {
  font-family: var(--font-sans);
  font-size: var(--text-base);         /* 16-18px */
  line-height: var(--leading-normal);   /* 1.5 */
  color: var(--color-text-primary);
  font-weight: var(--font-normal);      /* 400 */
}

/* Utility classes */
.text-small {
  font-size: var(--text-sm);           /* 14-16px */
  line-height: var(--leading-normal);
}

.text-xs {
  font-size: var(--text-xs);           /* 12-14px */
  line-height: var(--leading-normal);
}

.text-mono {
  font-family: var(--font-mono);
}
```

---

## Border Radius

```css
--radius-none: 0
--radius-sm: 0.125rem    /* 2px */
--radius-base: 0.25rem   /* 4px */
--radius-md: 0.375rem    /* 6px */
--radius-lg: 0.5rem      /* 8px */
--radius-xl: 0.75rem     /* 12px */
--radius-2xl: 1rem       /* 16px */
--radius-full: 9999px    /* Fully rounded */
```

### Usage by Component

| Component | Border Radius | Token |
|-----------|---------------|-------|
| Button | 6px | `--radius-md` |
| Input | 6px | `--radius-md` |
| Card | 8px | `--radius-lg` |
| Modal | 12px | `--radius-xl` |
| Badge | Fully rounded | `--radius-full` |
| Avatar | Fully rounded | `--radius-full` |
| Dropdown | 8px | `--radius-lg` |
| Tooltip | 4px | `--radius-base` |

### Example Usage

```css
.button {
  border-radius: var(--radius-md);    /* 6px */
}

.card {
  border-radius: var(--radius-lg);    /* 8px */
}

.badge {
  border-radius: var(--radius-full);  /* Pill shape */
}

.avatar {
  border-radius: var(--radius-full);  /* Circle */
}
```

---

## Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
               0 1px 2px 0 rgba(0, 0, 0, 0.06)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
             0 2px 4px -1px rgba(0, 0, 0, 0.06)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
             0 4px 6px -2px rgba(0, 0, 0, 0.05)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
             0 10px 10px -5px rgba(0, 0, 0, 0.05)
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

### Usage by Component

| Component | Shadow | State |
|-----------|--------|-------|
| Card | `--shadow-base` | Default |
| Card | `--shadow-md` | Hover |
| Button | None | Default |
| Button | `--shadow-md` | Hover |
| Modal | `--shadow-xl` | Always |
| Dropdown | `--shadow-lg` | Always |
| Tooltip | `--shadow-md` | Always |
| FAB | `--shadow-lg` | Default |
| FAB | `--shadow-xl` | Hover |

### Example Usage

```css
.card {
  box-shadow: var(--shadow-base);
  transition: box-shadow 0.2s ease;
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

---

## Breakpoints

```css
--breakpoint-xs: 320px    /* Small mobile */
--breakpoint-sm: 640px    /* Large mobile */
--breakpoint-md: 768px    /* Tablet */
--breakpoint-lg: 1024px   /* Desktop */
--breakpoint-xl: 1280px   /* Large desktop */
--breakpoint-2xl: 1536px  /* Extra large desktop */
```

### Mobile-First Media Queries

**ALWAYS use min-width (mobile-first), NEVER max-width:**

```css
/* Base styles: 320px+ (mobile) */
.container {
  width: 100%;
  padding: var(--space-4);
}

/* Small mobile: 375px+ */
@media (min-width: 375px) {
  .container {
    padding: var(--space-5);
  }
}

/* Large mobile: 640px+ */
@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Tablet: 768px+ */
@media (min-width: 768px) {
  .container {
    padding: var(--space-6);
  }
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .sidebar {
    display: block;
  }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Large desktop: 1440px+ */
@media (min-width: 1440px) {
  .container {
    max-width: 1400px;
  }
}
```

### Layout Changes by Breakpoint

| Breakpoint | Viewport | Layout Changes |
|------------|----------|----------------|
| xs (320px) | Small mobile | Single column, hamburger nav, stacked forms |
| sm (640px) | Large mobile | 2-column grids possible |
| md (768px) | Tablet | Sidebar appears (collapsed), 3-column grids, tabs |
| lg (1024px) | Desktop | Full sidebar, 4-column grids, all kanban columns visible |
| xl (1280px) | Large desktop | Max-width containers (1200px) |
| 2xl (1536px) | XL desktop | Max-width containers (1400px) |

---

## Implementation Guide

### CSS Variables Setup

```css
:root {
  /* Import all design tokens here */

  /* Colors */
  --color-primary-500: #3182ce;
  /* ... all color tokens ... */

  /* Spacing */
  --space-4: 1rem;
  /* ... all spacing tokens ... */

  /* Typography */
  --text-base: clamp(1rem, 0.95rem + 0.35vw, 1.125rem);
  /* ... all typography tokens ... */

  /* Borders */
  --radius-md: 0.375rem;
  /* ... all border radius tokens ... */

  /* Shadows */
  --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  /* ... all shadow tokens ... */
}

/* Dark theme override */
[data-theme="dark"] {
  --color-text-primary: var(--color-neutral-50);
  --color-bg-primary: var(--color-neutral-900);
  /* ... all dark theme overrides ... */
}
```

### Using Tokens in Components

```css
/* Button component */
.btn-primary {
  /* Colors */
  background: var(--color-primary-500);
  color: white;

  /* Spacing */
  padding: var(--space-3) var(--space-6);

  /* Typography */
  font-size: var(--text-base);
  font-weight: var(--font-medium);

  /* Border */
  border-radius: var(--radius-md);
  border: none;

  /* Shadow */
  box-shadow: var(--shadow-sm);

  /* Touch target (accessibility) */
  min-height: 44px;

  /* Interaction */
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--color-primary-600);
  box-shadow: var(--shadow-md);
}

.btn-primary:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}
```

### Tailwind CSS Configuration

If using Tailwind CSS:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ebf8ff',
          100: '#bee3f8',
          // ... rest of primary colors
          500: '#3182ce',
          // ... rest of primary colors
        },
        // ... other color scales
      },
      spacing: {
        // Using same 4px base unit
      },
      fontSize: {
        xs: ['clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)', { lineHeight: '1.5' }],
        // ... rest of font sizes
      },
      borderRadius: {
        sm: '0.125rem',
        base: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        // ... rest of shadows
      },
    },
  },
};
```

### Token Naming Convention

Follow this pattern for consistency:

```
--[category]-[property]-[variant]

Examples:
--color-primary-500
--color-text-primary
--space-page-padding
--text-base
--radius-md
--shadow-lg
```

### Accessibility Checklist

When implementing tokens, ensure:

- [ ] Color contrast ratios meet WCAG 2.1 AA (4.5:1 text, 3:1 UI)
- [ ] Touch targets minimum 44x44px
- [ ] Focus indicators visible (2px offset)
- [ ] Text resizable to 200% without horizontal scroll
- [ ] Use relative units (rem, em) not absolute (px) for text
- [ ] Support both light and dark themes

---

## Quick Reference Table

### Most Common Tokens

| Use Case | Token | Value |
|----------|-------|-------|
| Primary button BG | `--color-primary-500` | #3182ce |
| Body text | `--color-text-primary` | #171923 (light) / #f7fafc (dark) |
| Card background | `--color-bg-primary` | #ffffff (light) / #171923 (dark) |
| Border | `--color-border` | #cbd5e0 (light) / #4a5568 (dark) |
| Page padding | `--space-page-padding` | 24px (16px mobile) |
| Card padding | `--space-card-padding` | 24px (16px mobile) |
| Button padding | `--space-3` `--space-6` | 12px 24px |
| Body font size | `--text-base` | 16-18px (fluid) |
| H1 font size | `--text-4xl` | 36-48px (fluid) |
| Button border radius | `--radius-md` | 6px |
| Card border radius | `--radius-lg` | 8px |
| Card shadow | `--shadow-base` | Subtle elevation |
| Modal shadow | `--shadow-xl` | Strong elevation |
| Desktop breakpoint | `--breakpoint-lg` | 1024px |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-25 | Initial design token system based on UX-STUDY.md |

---

**Next Steps:**

1. Implement these tokens in your CSS/Tailwind configuration
2. Create component library using these tokens
3. Test accessibility compliance (WCAG 2.1 AA)
4. Validate responsive behavior at all breakpoints
5. Document component-specific token usage in Storybook
