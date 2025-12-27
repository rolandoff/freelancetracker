# FreelanceTracker

> A comprehensive time tracking and invoicing platform for French freelancers, built with React, TypeScript, and Supabase.

## 🚀 [Live Demo](https://freelancetracker.rolandoff.com)

**Try it now:** [https://freelancetracker.rolandoff.com](https://freelancetracker.rolandoff.com)

---

## 📋 Overview

FreelanceTracker is a full-stack web application designed specifically for French freelancers (micro-entrepreneurs / auto-entrepreneurs) to manage their entire business workflow from task creation to payment collection. It handles time tracking, client management, invoicing, and French social contribution calculations (URSSAF) in one unified platform.

## ✨ Key Features

- **🎯 Kanban Board** - Visual workflow management with drag & drop support
- **⏱️ Time Tracking** - Built-in timer with manual entry and activity history
- **👥 Client & Project Management** - Complete CRM for freelancers
- **💰 Flexible Rates** - Base rates with client-specific overrides per service type
- **📄 Automated Invoicing** - French-compliant PDF generation with legal requirements
- **📊 URSSAF Dashboard** - Automatic social contribution calculations (24.6% for 2025)
- **🔄 Real-time Updates** - Instant synchronization across devices
- **📎 File Attachments** - Upload and manage activity-related documents
- **🌓 Dark/Light Mode** - Full theme support with smooth transitions
- **🇫🇷 French Compliance** - SIRET validation, Article 293B, legal invoice mentions

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript 5
- Vite (build tool)
- shadcn/ui (Tailwind CSS + Radix UI)
- TanStack Query v5 (server state)
- Zustand (client state)
- @dnd-kit (drag and drop)
- @react-pdf/renderer (PDF generation)

**Backend:**
- Supabase (PostgreSQL, Auth, Storage, Realtime)
- Row Level Security (RLS)
- Automated backups

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier available)

### Installation

```bash
# Clone the repository
git clone https://github.com/rolandoff/freelancetracker.git
cd freelancetracker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase credentials to .env.local

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the app running locally.

## 📂 Project Structure

```
freelancetracker/
├── src/
│   ├── components/          # Reusable UI components
│   ├── features/            # Feature modules (auth, clients, invoices, etc.)
│   ├── lib/                 # Utilities and helpers
│   ├── hooks/               # Custom React hooks
│   └── types/               # TypeScript type definitions
├── supabase/                # Database schema and migrations
└── public/                  # Static assets
```

## 🇫🇷 French Compliance

This application includes specific features for French freelancers:

- **SIRET Validation** - 14-digit format validation
- **Article 293 B** - TVA non-applicable mention on invoices
- **Legal Mentions** - Required invoice information (EI status, payment terms, penalties)
- **URSSAF Calculations** - 24.6% social contribution rate for 2025
- **Revenue Thresholds** - Automatic alerts at 37,500€ (TVA) and 77,700€ (micro-entrepreneur limit)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

**Built with ❤️ for French freelancers**
