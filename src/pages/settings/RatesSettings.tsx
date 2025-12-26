import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { RatesTable } from '@/features/rates/components/RatesTable'

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
        <RatesTable />
      </CardContent>
    </Card>
  )
}
