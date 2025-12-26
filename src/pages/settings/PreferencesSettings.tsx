import { useUIStore } from '@/stores/uiStore'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useTranslation } from 'react-i18next'

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
              ☀️ Clair
            </Button>
            <Button
              variant={theme === 'dark' ? 'primary' : 'secondary'}
              onClick={() => theme !== 'dark' && toggleTheme()}
              className="flex items-center gap-2"
            >
              🌙 Sombre
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

          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map((lang) => (
              <Button
                key={lang.code}
                variant={i18n.language === lang.code ? 'primary' : 'secondary'}
                onClick={() => handleLanguageChange(lang.code)}
                className="flex items-center gap-2 justify-start"
              >
                <span className="text-xl">{lang.flag}</span>
                {lang.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
