import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/stores/uiStore'
import { useTimerStore } from '@/stores/timerStore'
import { supabase } from '@/lib/supabase'
import { formatDuration } from '@/utils/format'
import { Button } from '@/components/ui/Button'

export function Header() {
  const { user } = useAuth()
  const { theme, toggleTheme, toggleSidebar } = useUIStore()
  const { isRunning, elapsedSeconds, activityId } = useTimerStore()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-accent"
          aria-label="Toggle sidebar"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Timer Widget */}
        {isRunning && activityId && (
          <div className="flex items-center gap-2 rounded-md bg-primary-100 dark:bg-primary-900 px-4 py-2">
            <div className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              Timer: {formatDuration(Math.floor(elapsedSeconds / 60))}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-accent"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {/* User menu */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.email}</p>
            <p className="text-xs text-muted-foreground">Freelance</p>
          </div>

          <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-semibold">
            {user?.email?.charAt(0).toUpperCase()}
          </div>

          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Déconnexion
          </Button>
        </div>
      </div>
    </header>
  )
}
