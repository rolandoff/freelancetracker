import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export function RatesSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Tarifs</CardTitle>
        <CardDescription>
          Configurez vos tarifs horaires par défaut et par client
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border border-border bg-muted p-8 text-center">
          <p className="text-muted-foreground">
            La gestion des tarifs sera implémentée dans la Task 6
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Vous pourrez configurer des tarifs de base par type de service et des tarifs
            spécifiques par client
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
