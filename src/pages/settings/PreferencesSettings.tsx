import { useUIStore } from '@/stores/uiStore'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export function PreferencesSettings() {
  const { theme, toggleTheme } = useUIStore()

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

        {/* Language (Coming Soon) */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">Langue</h3>
            <p className="text-sm text-muted-foreground">
              La langue de l'interface (actuellement: Français)
            </p>
          </div>
          <p className="text-sm text-muted-foreground italic">
            Autres langues disponibles prochainement
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
