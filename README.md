# Freelancer Time Tracker

> A comprehensive time tracking and invoicing platform for French freelancers, built with React, TypeScript, and Supabase.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg)](https://supabase.com/)

## Overview

Freelancer Time Tracker is a full-stack web application designed specifically for French freelancers (micro-entrepreneurs / auto-entrepreneurs) to manage their entire workflow from task creation to payment collection. It handles time tracking, invoicing, and French social contribution calculations (URSSAF) in one unified platform.

### Key Features

- **Kanban Workflow Board** - 6-state activity workflow with drag & drop
- **Time Tracking** - Automatic timer and manual entry support
- **Client & Project Management** - Complete CRM for freelancers
- **Flexible Rates** - Base rates + client-specific rates per service type
- **Automated Invoicing** - French-compliant PDF generation with legal mentions
- **URSSAF Dashboard** - Automatic social contribution calculations (24.6% for 2025)
- **Real-time Collaboration** - Supabase Realtime for instant updates
- **File Attachments** - Upload and manage activity-related files
- **Dark/Light Mode** - Full theme support
- **French Compliance** - SIRET validation, Article 293B, legal invoice requirements

## Documentation

All project documentation is located in the [`/docs`](./docs) folder:

### Core Documentation
- [**PRD-COMPLETE.md**](./docs/PRD-COMPLETE.md) - Complete Product Requirements Document
- [**DIAGRAMAS-CASOS-USO.md**](./docs/DIAGRAMAS-CASOS-USO.md) - Use Case Diagrams and Workflows
- [**EJEMPLOS-CODIGO.md**](./docs/EJEMPLOS-CODIGO.md) - Code Examples and Patterns
- [**freelancer-time-tracker.md**](./docs/freelancer-time-tracker.md) - Implementation Plan (PRP)

### Setup & Development
- [**SETUP.md**](./docs/SETUP.md) - Environment Setup Guide
- [**CONTRIBUTING.md**](./CONTRIBUTING.md) - Contribution Guidelines
- [**DATABASE.md**](./docs/DATABASE.md) - Database Schema and Migration Guide
- [**TESTING.md**](./docs/TESTING.md) - Testing Strategy and Guidelines

### Deployment & Operations
- [**DEPLOYMENT.md**](./docs/DEPLOYMENT.md) - Deployment Guide for LWS/cPanel
- [**SECURITY.md**](./docs/SECURITY.md) - Security Best Practices
- [**TROUBLESHOOTING.md**](./docs/TROUBLESHOOTING.md) - Common Issues and Solutions

## Tech Stack

### Frontend
- **React 18** with **TypeScript 5**
- **Vite** - Build tool
- **shadcn/ui** - UI components (Tailwind CSS + Radix UI)
- **TanStack Query v5** - Server state management
- **Zustand** - Client state management
- **React Router v6** - Routing
- **@dnd-kit** - Drag and drop
- **@react-pdf/renderer** - PDF generation
- **Recharts** - Data visualization

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Storage
  - Realtime subscriptions
  - Row Level Security (RLS)

### Development Tools
- **Storybook 8** - Component documentation
- **ESLint** + **Prettier** - Code quality
- **Vitest** - Unit testing
- **React Testing Library** - Component testing

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier available)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/freelancer-time-tracker.git
cd freelancer-time-tracker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app.

For detailed setup instructions, see [SETUP.md](./docs/SETUP.md).

## Project Structure

```
freelancer-time-tracker/
├── docs/                      # Documentation
├── src/
│   ├── components/           # Reusable components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/          # Layout components
│   │   └── shared/          # Shared components
│   ├── features/            # Feature modules
│   │   ├── auth/
│   │   ├── clients/
│   │   ├── projects/
│   │   ├── rates/
│   │   ├── activities/
│   │   ├── invoices/
│   │   ├── dashboard/
│   │   └── settings/
│   ├── lib/                 # Utilities
│   ├── hooks/               # Global hooks
│   ├── store/               # Zustand stores
│   ├── types/               # TypeScript types
│   └── styles/              # Global styles
├── public/                   # Static assets
├── supabase/                # Database schema and migrations
└── .storybook/              # Storybook configuration
```

## Development Workflow

### Available Commands

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript compiler
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run storybook        # Start Storybook
npm run build:storybook  # Build Storybook
```

### Workflow States

Activities follow a 6-state workflow:

```
Por Validar → En Curso → En Prueba → Completada → Por Facturar → Facturada
```

Each state transition is validated to ensure data integrity.

## French Compliance

This application is specifically designed for French freelancers and includes:

- **SIRET Validation** - 14-digit validation for clients and user
- **Article 293 B** - TVA non-applicable mention on invoices
- **Legal Mentions** - Required invoice information (EI status, payment terms, late penalties)
- **URSSAF Calculations** - 24.6% social contribution rate for 2025
- **CA Thresholds** - Alerts at 37,500€ (TVA) and 77,700€ (plafond micro-entrepreneur)

## URSSAF Dashboard

Automatic calculation of:
- Monthly revenue (CA mensuel)
- Annual revenue (CA annuel)
- Social contributions (Cotisations sociales) at 24.6%
- Progress vs annual threshold (77,700€)
- TVA threshold alerts (37,500€)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on:
- Code of conduct
- Development process
- Submitting pull requests
- Coding standards

## Security

Security is a top priority. Please see [SECURITY.md](./docs/SECURITY.md) for:
- Security best practices
- Reporting vulnerabilities
- Row Level Security (RLS) implementation
- Data protection guidelines

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Roadmap

### Phase 1 - MVP (Weeks 1-2) ✅ COMPLETE
- [x] Authentication and user settings
- [x] Client and project CRUD
- [x] Basic activities structure
- [x] Kanban board (basic structure)
- [x] Protected routes and layouts

### Phase 2 - Core Features (Weeks 3-4) 🚧 IN PROGRESS
- [x] Kanban drag & drop with @dnd-kit
- [x] Realtime updates with Supabase
- [x] Configurable rates (base + client-specific)
- [x] Automatic timer with sidebar widget
- [ ] Manual time entry forms
- [ ] File attachments
- [ ] Invoice creation and PDF generation

### Phase 3 - Polish (Week 5)
- [ ] Dashboard with KPIs
- [ ] URSSAF module
- [ ] Client reports
- [x] Dark mode (theme provider implemented)
- [ ] Storybook documentation
- [ ] Production deployment

### Future Enhancements
- [ ] Email invoice delivery
- [ ] Multi-currency support
- [ ] Recurring invoices
- [ ] Mobile app (React Native)
- [ ] Expense tracking
- [ ] Bank reconciliation
- [ ] Multi-user/team support

## Support

- **Documentation**: See `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/yourusername/freelancer-time-tracker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/freelancer-time-tracker/discussions)

## Acknowledgments

- [Supabase](https://supabase.com/) - Backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [dnd-kit](https://dndkit.com/) - Drag and drop

## Authors

- Your Name - Initial work

---

**Built with ❤️ for French freelancers**
