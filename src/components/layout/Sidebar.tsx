import { NavLink } from 'react-router-dom'
import { useUIStore } from '@/stores/uiStore'
import { ROUTES } from '@/lib/constants'
import { clsx } from 'clsx'
import { TimeTracker } from '@/features/activities/components/TimeTracker'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  Folder,
  FileText,
  PiggyBank,
  BarChart3,
  Settings,
} from 'lucide-react'

const navigation = [
  { nameKey: 'sidebar.dashboard', href: ROUTES.DASHBOARD, Icon: LayoutDashboard },
  { nameKey: 'sidebar.kanban', href: ROUTES.KANBAN, Icon: KanbanSquare },
  { nameKey: 'sidebar.clients', href: ROUTES.CLIENTS, Icon: Users },
  { nameKey: 'sidebar.projects', href: ROUTES.PROJECTS, Icon: Folder },
  { nameKey: 'sidebar.invoices', href: ROUTES.INVOICES, Icon: FileText },
  { nameKey: 'sidebar.urssaf', href: ROUTES.URSSAF, Icon: PiggyBank },
  { nameKey: 'sidebar.reports', href: ROUTES.REPORTS, Icon: BarChart3 },
  { nameKey: 'sidebar.settings', href: ROUTES.SETTINGS, Icon: Settings },
]

export function Sidebar() {
  const { t } = useTranslation()
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
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.nameKey}
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
              <item.Icon className="h-5 w-5" />
              {sidebarOpen && <span>{t(item.nameKey)}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Timer Widget */}
        {sidebarOpen && (
          <div className="p-4 border-t border-border">
            <TimeTracker />
          </div>
        )}
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
              key={item.nameKey}
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
              <item.Icon className="h-5 w-5" />
              <span>{t(item.nameKey)}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
