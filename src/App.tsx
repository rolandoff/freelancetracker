import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryProvider } from './providers/QueryProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { AppLayout } from './components/layout/AppLayout'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ForgotPassword } from './pages/ForgotPassword'
import { Dashboard } from './pages/Dashboard'
import { Clients } from './pages/Clients'
import { Projects } from './pages/Projects'
import { SettingsLayout } from './pages/settings/SettingsLayout'
import { ProfileSettings } from './pages/settings/ProfileSettings'
import { LegalSettings } from './pages/settings/LegalSettings'
import { PreferencesSettings } from './pages/settings/PreferencesSettings'
import { KanbanPage } from './features/activities/pages/KanbanPage'
import { RatesSettings } from './pages/settings/RatesSettings'
import { InvoicesPage } from './features/invoices/pages/InvoicesPage'
import { InvoiceCreatePage } from './features/invoices/pages/InvoiceCreatePage'
import { ROUTES } from './lib/constants'

function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.REGISTER} element={<Register />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />

            {/* Protected routes */}
            <Route element={<AppLayout />}>
              <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

              {/* Settings with nested routes */}
              <Route path={ROUTES.SETTINGS} element={<SettingsLayout />}>
                <Route index element={<Navigate to={ROUTES.SETTINGS_PROFILE} replace />} />
                <Route path="profile" element={<ProfileSettings />} />
                <Route path="rates" element={<RatesSettings />} />
                <Route path="legal" element={<LegalSettings />} />
                <Route path="preferences" element={<PreferencesSettings />} />
              </Route>

              {/* Clients and Projects */}
              <Route path={ROUTES.CLIENTS} element={<Clients />} />
              <Route path={ROUTES.PROJECTS} element={<Projects />} />

              {/* Activities */}
              <Route path={ROUTES.KANBAN} element={<KanbanPage />} />

              {/* Invoices */}
              <Route path={ROUTES.INVOICES} element={<InvoicesPage />} />
              <Route path="/invoices/new" element={<InvoiceCreatePage />} />
              <Route path="/invoices/:id" element={<PlaceholderPage title="Détail Facture" />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryProvider>
  )
}

// Placeholder component for routes not yet implemented
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          Cette page sera implémentée prochainement
        </p>
      </div>
    </div>
  )
}

export default App
