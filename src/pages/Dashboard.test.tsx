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

    expect(screen.getByText(/ca mensuel/i)).toBeInTheDocument()
    expect(screen.getByText(/ca annuel/i)).toBeInTheDocument()
    expect(screen.getByText(/activités actives/i)).toBeInTheDocument()
    expect(screen.getByText(/factures en attente/i)).toBeInTheDocument()

    expect(screen.getByRole('heading', { name: /actions rapides/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /nouvelle activité/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /nouvelle facture/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /nouveau client/i })).toBeInTheDocument()
  })
})
