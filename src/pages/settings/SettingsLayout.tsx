import { Link, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/utils/cn'

const settingsNav = [
  { name: 'Profil', href: ROUTES.SETTINGS_PROFILE },
  { name: 'Tarifs', href: ROUTES.SETTINGS_RATES },
  { name: 'Informations Légales', href: ROUTES.SETTINGS_LEGAL },
  { name: 'Préférences', href: ROUTES.SETTINGS_PREFERENCES },
]

export function SettingsLayout() {
  const location = useLocation()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">Gérez votre compte et vos préférences</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar Navigation */}
        <aside className="lg:w-64">
          <nav className="space-y-1">
            {settingsNav.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'block px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  location.pathname === item.href
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
