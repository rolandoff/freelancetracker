import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PiggyBank, AlertTriangle, CheckCircle } from 'lucide-react'
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
        <div className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-primary-500" />
          <CardTitle>URSSAF & Plafonds</CardTitle>
        </div>
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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">CA Annuel</span>
            <span className="text-sm font-mono font-semibold text-primary-600">
              {formatCurrency(urssafData.annualRevenue)}
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={Math.min(urssafData.percentageOfPlafond, 100)} 
              className="h-3"
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {urssafData.percentageOfPlafond.toFixed(1)}% du plafond
            </span>
            <span className="font-medium">
              {formatCurrency(urssafData.plafondCA)}
            </span>
          </div>
        </div>

        {/* Cotisations */}
        <div className="rounded-xl border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-primary-100/50 p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-primary-900">Cotisations URSSAF</p>
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 rounded-full bg-primary-200 text-primary-800 text-xs font-bold">
                  {urssafData.cotisationsRate}%
                </div>
                <p className="text-xs text-primary-700">de taux</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary-600">
                {formatCurrency(urssafData.cotisationsAmount)}
              </p>
              <p className="text-xs text-primary-600/70 mt-1">à payer</p>
            </div>
          </div>
        </div>

        {/* Thresholds */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
            {urssafData.exceedsTVAThreshold ? (
              <AlertTriangle className="h-5 w-5 text-warning-500 flex-shrink-0" />
            ) : (
              <CheckCircle className="h-5 w-5 text-success-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">Seuil TVA</p>
              <p className="text-xs text-muted-foreground">Franchise TVA</p>
            </div>
            <span className={`text-sm font-bold ${urssafData.exceedsTVAThreshold ? 'text-warning-600' : 'text-success-600'}`}>
              {formatCurrency(urssafData.tvaThreshold)}
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
            {urssafData.exceedsPlafond ? (
              <AlertTriangle className="h-5 w-5 text-error-500 flex-shrink-0" />
            ) : (
              <CheckCircle className="h-5 w-5 text-success-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">Plafond micro-entrepreneur</p>
              <p className="text-xs text-muted-foreground">Limite annuelle</p>
            </div>
            <span className={`text-sm font-bold ${urssafData.exceedsPlafond ? 'text-error-600' : 'text-success-600'}`}>
              {formatCurrency(urssafData.plafondCA)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
