import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/utils/format'
import { calculateURSSAF, getURSSAFAlert } from '../utils/urssafCalculations'

interface URSSAFWidgetProps {
  annualRevenue: number
  customRate?: number
  loading?: boolean
}

export function URSSAFWidget({ annualRevenue, customRate, loading }: URSSAFWidgetProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>URSSAF & Plafonds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-8 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const urssafData = calculateURSSAF(annualRevenue, customRate)
  const alert = getURSSAFAlert(urssafData)

  return (
    <Card>
      <CardHeader>
        <CardTitle>URSSAF & Plafonds</CardTitle>
        <CardDescription>Suivi des cotisations et seuils fiscaux 2025</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Alert if any */}
        {alert && (
          <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        {/* CA Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">CA Annuel</span>
            <span className="text-muted-foreground">
              {formatCurrency(urssafData.annualRevenue)} / {formatCurrency(urssafData.plafondCA)}
            </span>
          </div>
          <Progress value={Math.min(urssafData.percentageOfPlafond, 100)} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {urssafData.percentageOfPlafond.toFixed(1)}% du plafond micro-entrepreneur
          </p>
        </div>

        {/* Cotisations */}
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Cotisations URSSAF</p>
              <p className="text-xs text-muted-foreground">
                Taux: {urssafData.cotisationsRate}%
              </p>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(urssafData.cotisationsAmount)}</p>
          </div>
        </div>

        {/* Thresholds */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Seuil TVA</span>
            <span className={urssafData.exceedsTVAThreshold ? 'text-orange-600 font-medium' : ''}>
              {formatCurrency(urssafData.tvaThreshold)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Plafond micro-entrepreneur</span>
            <span className={urssafData.exceedsPlafond ? 'text-red-600 font-medium' : ''}>
              {formatCurrency(urssafData.plafondCA)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
