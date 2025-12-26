import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/utils/format'
import type { MonthlyRevenueData } from '../hooks/useDashboardData'

interface RevenueChartProps {
  data: MonthlyRevenueData[]
  loading?: boolean
}

export function RevenueChart({ data, loading }: RevenueChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Évolution du Chiffre d'Affaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary-500" />
          <CardTitle>Évolution du Chiffre d'Affaires</CardTitle>
        </div>
        <CardDescription>Revenus mensuels des 12 derniers mois</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fill: 'currentColor', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor', fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value)}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '2px solid #8b5cf6',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)',
                  padding: '12px',
                }}
                labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
                formatter={(value: number) => [formatCurrency(value), 'Chiffre d\'Affaires']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="none"
                fill="url(#revenueGradient)"
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
