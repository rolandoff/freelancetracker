import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/testUtils'
import { Dashboard } from './Dashboard'

describe('Dashboard page', () => {
  it('renders heading, subtitle, metric cards and quick actions', () => {
    render(<Dashboard />)

    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
    expect(
      screen.getByText(/bienvenue sur votre tableau de bord/i)
    ).toBeInTheDocument()

    // Check for KPI card titles (using getAllByText since titles may appear multiple times)
    expect(screen.getAllByText(/ca mensuel/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/ca annuel/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/activités actives/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/factures en attente/i).length).toBeGreaterThan(0)

    expect(screen.getByRole('heading', { name: /actions rapides/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /nouvelle activité/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /nouvelle facture/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /nouveau client/i })).toBeInTheDocument()
  })
})
