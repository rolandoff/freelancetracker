import { useUIStore } from '@/stores/uiStore'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Label } from '@/components/ui/Label'
import { useTranslation } from 'react-i18next'
import { Moon, Sun } from 'lucide-react'

const LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
]

export function PreferencesSettings() {
  const { theme, toggleTheme } = useUIStore()
  const { i18n } = useTranslation()
  
  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode)
    localStorage.setItem('i18nextLng', langCode)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Préférences</CardTitle>
        <CardDescription>Personnalisez votre expérience utilisateur</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Theme */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">Thème</h3>
            <p className="text-sm text-muted-foreground">
              Choisissez le thème d'affichage de l'application
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant={theme === 'light' ? 'primary' : 'secondary'}
              onClick={() => theme !== 'light' && toggleTheme()}
              className="flex items-center gap-2"
            >
              <Sun className="h-4 w-4" />
              Clair
            </Button>
            <Button
              variant={theme === 'dark' ? 'primary' : 'secondary'}
              onClick={() => theme !== 'dark' && toggleTheme()}
              className="flex items-center gap-2"
            >
              <Moon className="h-4 w-4" />
              Sombre
            </Button>
          </div>
        </div>

        {/* Language */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">Langue / Language</h3>
            <p className="text-sm text-muted-foreground">
              Choisissez la langue de l'interface
            </p>
          </div>

          <div className="max-w-xs">
            <Label htmlFor="language-select">Langue</Label>
            <select
              id="language-select"
              value={i18n.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="mt-2 w-full px-3 py-2 rounded-lg border-2 border-border bg-background text-foreground focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
