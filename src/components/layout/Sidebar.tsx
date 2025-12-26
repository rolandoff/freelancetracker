import { NavLink } from 'react-router-dom'
import { useUIStore } from '@/stores/uiStore'
import { ROUTES } from '@/lib/constants'
import { clsx } from 'clsx'
import { TimeTracker } from '@/features/activities/components/TimeTracker'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  Folder,
  FileText,
  Settings,
} from 'lucide-react'

const navigation = [
  { nameKey: 'sidebar.dashboard', href: ROUTES.DASHBOARD, Icon: LayoutDashboard },
  { nameKey: 'sidebar.kanban', href: ROUTES.KANBAN, Icon: KanbanSquare },
  { nameKey: 'sidebar.clients', href: ROUTES.CLIENTS, Icon: Users },
  { nameKey: 'sidebar.projects', href: ROUTES.PROJECTS, Icon: Folder },
  { nameKey: 'sidebar.invoices', href: ROUTES.INVOICES, Icon: FileText },
  { nameKey: 'sidebar.settings', href: ROUTES.SETTINGS, Icon: Settings },
]

export function Sidebar() {
  const { t } = useTranslation()
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)

  return (
    <>
      {/* Sidebar for desktop */}
      <aside
        className="hidden lg:flex lg:flex-col lg:border-r lg:border-border lg:bg-card transition-all duration-300"
        style={{ width: sidebarOpen ? '256px' : '80px' }}
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
          {navigation.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
            >
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 shadow-soft'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:translate-x-1'
                  )
                }
              >
                <item.Icon className="h-5 w-5" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {t(item.nameKey)}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Timer Widget */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="p-4 border-t border-border"
            >
              <TimeTracker />
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={clsx(
          'lg:hidden fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-transform duration-300',
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
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
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
