import { Card, CardContent } from '@/components/ui/Card'
import { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
  }
  loading?: boolean
}

export function KPICard({ title, value, icon: Icon, trend, loading }: KPICardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-8 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</h3>
            <p className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">{value}</p>
            {trend && (
              <p className="text-xs text-muted-foreground">
                {trend.label}
              </p>
            )}
          </div>
          {Icon && (
            <div className="p-3 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-xl border border-primary-500/20">
              <Icon className="w-6 h-6 text-primary-600" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
