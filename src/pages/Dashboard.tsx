import { useNavigate } from 'react-router-dom'
import { Euro, TrendingUp, Activity, FileText, Plus, Users } from 'lucide-react'
import { KPICard } from '@/features/dashboard/components/KPICard'
import { RevenueChart } from '@/features/dashboard/components/RevenueChart'
import { URSSAFWidget } from '@/features/dashboard/components/URSSAFWidget'
import { useDashboardKPIs, useMonthlyRevenue } from '@/features/dashboard/hooks/useDashboardData'
import { formatCurrency } from '@/utils/format'
import { useTranslation } from 'react-i18next'

export function Dashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs()
  const { data: monthlyRevenue, isLoading: chartLoading } = useMonthlyRevenue()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">
          {t('dashboard.welcome')}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title={t('dashboard.monthlyRevenue')}
          value={kpis ? formatCurrency(kpis.monthlyRevenue) : '—'}
          icon={Euro}
          loading={kpisLoading}
        />
        <KPICard
          title={t('dashboard.annualRevenue')}
          value={kpis ? formatCurrency(kpis.annualRevenue) : '—'}
          icon={TrendingUp}
          loading={kpisLoading}
        />
        <KPICard
          title={t('dashboard.activeActivities')}
          value={kpis?.activeActivitiesCount ?? 0}
          icon={Activity}
          loading={kpisLoading}
        />
        <KPICard
          title={t('dashboard.pendingInvoices')}
          value={kpis?.pendingInvoicesCount ?? 0}
          icon={FileText}
          trend={
            kpis && kpis.pendingInvoicesAmount > 0
              ? {
                  value: kpis.pendingInvoicesAmount,
                  label: formatCurrency(kpis.pendingInvoicesAmount),
                }
              : undefined
          }
          loading={kpisLoading}
        />
      </div>

      {/* Charts and URSSAF */}
      <div className="grid gap-6 md:grid-cols-2">
        <RevenueChart data={monthlyRevenue || []} loading={chartLoading} />
        <URSSAFWidget annualRevenue={kpis?.annualRevenue || 0} loading={kpisLoading} />
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">{t('dashboard.quickActions')}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <button
            onClick={() => navigate('/kanban')}
            className="rounded-md border border-border p-4 text-left hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <Plus className="w-5 h-5 text-primary-500" />
            </div>
            <h3 className="font-medium">{t('dashboard.newActivity')}</h3>
            <p className="text-sm text-muted-foreground">{t('dashboard.newActivityDesc')}</p>
          </button>
          <button
            onClick={() => navigate('/invoices/new')}
            className="rounded-md border border-border p-4 text-left hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-primary-500" />
            </div>
            <h3 className="font-medium">{t('dashboard.newInvoice')}</h3>
            <p className="text-sm text-muted-foreground">{t('dashboard.newInvoiceDesc')}</p>
          </button>
          <button
            onClick={() => navigate('/clients')}
            className="rounded-md border border-border p-4 text-left hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-primary-500" />
            </div>
            <h3 className="font-medium">{t('dashboard.newClient')}</h3>
            <p className="text-sm text-muted-foreground">{t('dashboard.newClientDesc')}</p>
          </button>
        </div>
      </div>
    </div>
  )
}
