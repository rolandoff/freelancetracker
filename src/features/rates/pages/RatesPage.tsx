import { RatesTable } from '../components/RatesTable'

export function RatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tarifas</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tus tarifas base y tarifas específicas por cliente
        </p>
      </div>

      <RatesTable />
    </div>
  )
}
