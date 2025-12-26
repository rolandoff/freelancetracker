import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { startOfMonth, startOfYear, subMonths } from 'date-fns'

export interface DashboardKPIs {
  monthlyRevenue: number
  annualRevenue: number
  activeActivitiesCount: number
  pendingInvoicesCount: number
  pendingInvoicesAmount: number
  hoursThisWeek: number
}

export interface MonthlyRevenueData {
  month: string
  revenue: number
}

export interface ServiceTypeDistribution {
  serviceType: string
  revenue: number
  count: number
}

export function useDashboardKPIs() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['dashboard', 'kpis', user?.id],
    queryFn: async (): Promise<DashboardKPIs> => {
      if (!user) throw new Error('User not authenticated')

      const now = new Date()
      const monthStart = startOfMonth(now)
      const yearStart = startOfYear(now)

      // Monthly revenue (paid invoices this month)
      const { data: monthlyInvoices } = await supabase
        .from('invoices')
        .select('total_ttc')
        .eq('user_id', user.id)
        .eq('status', 'pagada')
        .gte('payment_date', monthStart.toISOString())

      const monthlyRevenue = (monthlyInvoices as Array<{ total_ttc: number }>)?.reduce((sum, inv) => sum + (inv.total_ttc || 0), 0) || 0

      // Annual revenue (paid invoices this year)
      const { data: annualInvoices } = await supabase
        .from('invoices')
        .select('total_ttc')
        .eq('user_id', user.id)
        .eq('status', 'pagada')
        .gte('payment_date', yearStart.toISOString())

      const annualRevenue = (annualInvoices as Array<{ total_ttc: number }>)?.reduce((sum, inv) => sum + (inv.total_ttc || 0), 0) || 0

      // Active activities count
      const { count: activeActivitiesCount } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['en_curso', 'en_prueba', 'por_validar'])

      // Pending invoices
      const { data: pendingInvoices, count: pendingInvoicesCount } = await supabase
        .from('invoices')
        .select('total_ttc', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'en_espera_pago')

      const pendingInvoicesAmount = (pendingInvoices as Array<{ total_ttc: number }> | null)?.reduce((sum, inv) => sum + (inv.total_ttc || 0), 0) || 0

      // Hours this week (time entries from last 7 days)
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)

      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('duration_minutes')
        .eq('user_id', user.id)
        .gte('start_time', weekAgo.toISOString())

      const hoursThisWeek = ((timeEntries as Array<{ duration_minutes: number }> | null)?.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0) || 0) / 60

      return {
        monthlyRevenue,
        annualRevenue,
        activeActivitiesCount: activeActivitiesCount || 0,
        pendingInvoicesCount: pendingInvoicesCount || 0,
        pendingInvoicesAmount,
        hoursThisWeek,
      }
    },
    enabled: !!user,
  })
}

export function useMonthlyRevenue() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['dashboard', 'monthly-revenue', user?.id],
    queryFn: async (): Promise<MonthlyRevenueData[]> => {
      if (!user) throw new Error('User not authenticated')

      const months: MonthlyRevenueData[] = []
      const now = new Date()

      for (let i = 11; i >= 0; i--) {
        const monthDate = subMonths(now, i)
        const monthStart = startOfMonth(monthDate)
        const monthEnd = startOfMonth(subMonths(now, i - 1))

        const { data: invoices } = await supabase
          .from('invoices')
          .select('total_ttc')
          .eq('user_id', user.id)
          .eq('status', 'pagada')
          .gte('payment_date', monthStart.toISOString())
          .lt('payment_date', monthEnd.toISOString())

        const revenue = (invoices as Array<{ total_ttc: number }> | null)?.reduce((sum, inv) => sum + (inv.total_ttc || 0), 0) || 0

        months.push({
          month: monthDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
          revenue,
        })
      }

      return months
    },
    enabled: !!user,
  })
}

export function useServiceTypeDistribution() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['dashboard', 'service-distribution', user?.id],
    queryFn: async (): Promise<ServiceTypeDistribution[]> => {
      if (!user) throw new Error('User not authenticated')

      const yearStart = startOfYear(new Date())

      const { data: activities } = await supabase
        .from('activities')
        .select(`
          service_type,
          hourly_rate,
          time_entries!inner(duration_minutes)
        `)
        .eq('user_id', user.id)
        .gte('created_at', yearStart.toISOString())

      const distribution = new Map<string, { revenue: number; count: number }>()

      interface ActivityWithEntries {
        service_type: string
        hourly_rate: number
        time_entries: Array<{ duration_minutes: number }>
      }

      (activities as ActivityWithEntries[] | null)?.forEach((activity) => {
        const serviceType = activity.service_type
        const rate = activity.hourly_rate || 0
        const totalMinutes = activity.time_entries?.reduce(
          (sum, entry) => sum + (entry.duration_minutes || 0),
          0
        ) || 0
        const revenue = (totalMinutes / 60) * rate

        const current = distribution.get(serviceType) || { revenue: 0, count: 0 }
        distribution.set(serviceType, {
          revenue: current.revenue + revenue,
          count: current.count + 1,
        })
      })

      return Array.from(distribution.entries()).map(([serviceType, data]) => ({
        serviceType,
        revenue: data.revenue,
        count: data.count,
      }))
    },
    enabled: !!user,
  })
}
