import { NavLink } from 'react-router-dom'
import { useUIStore } from '@/stores/uiStore'
import { ROUTES } from '@/lib/constants'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
  { name: 'Kanban', href: ROUTES.KANBAN, icon: 'Kanban' },
  { name: 'Clients', href: ROUTES.CLIENTS, icon: 'Users' },
  { name: 'Projets', href: ROUTES.PROJECTS, icon: 'Folder' },
  { name: 'Factures', href: ROUTES.INVOICES, icon: 'FileText' },
  { name: 'URSSAF', href: ROUTES.URSSAF, icon: 'PiggyBank' },
  { name: 'Rapports', href: ROUTES.REPORTS, icon: 'BarChart3' },
  { name: 'Paramètres', href: ROUTES.SETTINGS, icon: 'Settings' },
]

export function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)

  return (
    <>
      {/* Sidebar for desktop */}
      <aside
        className={clsx(
          'hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-border lg:bg-card',
          !sidebarOpen && 'lg:w-20'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold">
              FT
            </div>
            {sidebarOpen && <span className="font-semibold text-lg">FreelanceTracker</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <span className="h-5 w-5">
                {/* Icon placeholder - will add lucide-react icons later */}
                📊
              </span>
              {sidebarOpen && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 w-64 transform border-r border-border bg-card transition-transform duration-200 lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold">
              FT
            </div>
            <span className="font-semibold text-lg">FreelanceTracker</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
              onClick={() => useUIStore.getState().setSidebarOpen(false)}
            >
              <span className="h-5 w-5">📊</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
