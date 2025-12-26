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
      <div className="rounded-xl border border-border/50 bg-card p-6 shadow-soft">
        <h2 className="text-xl font-semibold mb-6">{t('dashboard.quickActions')}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <button
            onClick={() => navigate('/kanban')}
            className="group relative rounded-xl border-2 border-border/50 p-6 text-left bg-gradient-to-br from-background to-accent/20 hover:border-primary-300 hover:shadow-medium transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-lg group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="font-semibold text-lg">{t('dashboard.newActivity')}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{t('dashboard.newActivityDesc')}</p>
          </button>
          <button
            onClick={() => navigate('/invoices/new')}
            className="group relative rounded-xl border-2 border-border/50 p-6 text-left bg-gradient-to-br from-background to-accent/20 hover:border-success-400 hover:shadow-medium transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-success-500/20 to-success-600/20 rounded-lg group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5 text-success-600" />
              </div>
              <h3 className="font-semibold text-lg">{t('dashboard.newInvoice')}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{t('dashboard.newInvoiceDesc')}</p>
          </button>
          <button
            onClick={() => navigate('/clients')}
            className="group relative rounded-xl border-2 border-border/50 p-6 text-left bg-gradient-to-br from-background to-accent/20 hover:border-warning-400 hover:shadow-medium transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-warning-500/20 to-warning-600/20 rounded-lg group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-warning-600" />
              </div>
              <h3 className="font-semibold text-lg">{t('dashboard.newClient')}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{t('dashboard.newClientDesc')}</p>
          </button>
        </div>
      </div>
    </div>
  )
}
