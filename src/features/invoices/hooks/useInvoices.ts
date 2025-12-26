// @ts-nocheck - Supabase type system has issues with never types that prevent compilation
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Invoice } from '@/types/database.types'

export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('invoices')
        .select('*, client:clients(name), activities:invoice_activities(activity:activities(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Invoice[]
    },
  })
}

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, client:clients(*), activities:invoice_activities(activity:activities(*))')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Invoice
    },
    enabled: !!id,
  })
}

export const useCreateInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (invoice: {
      client_id: string
      activity_ids: string[]
      discount_amount?: number
      discount_type?: 'percentage' | 'fixed'
      notes?: string
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get next invoice number for the year
      const year = new Date().getFullYear()
      const { data: lastInvoice } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('user_id', user.id)
        .like('invoice_number', `${year}-%`)
        .order('invoice_number', { ascending: false })
        .limit(1)
        .single()

      let nextNumber = 1
      if (lastInvoice) {
        // @ts-expect-error - Supabase type inference issue
        const lastNumber = parseInt(lastInvoice.invoice_number.split('-')[1])
        nextNumber = lastNumber + 1
      }

      const invoiceNumber = `${year}-${nextNumber.toString().padStart(4, '0')}`

      // Calculate totals from activities
      const { data: activities } = await supabase
        .from('activities')
        .select('estimated_hours, hourly_rate')
        .in('id', invoice.activity_ids)

      interface ActivitySubset {
        estimated_hours: number | null
        hourly_rate: number | null
      }

      const subtotal =
        (activities as ActivitySubset[] | null)?.reduce((sum, act) => sum + (act.estimated_hours || 0) * (act.hourly_rate || 0), 0) || 0

      let discountAmount = 0
      if (invoice.discount_amount) {
        discountAmount =
          invoice.discount_type === 'percentage'
            ? subtotal * (invoice.discount_amount / 100)
            : invoice.discount_amount
      }

      const total = subtotal - discountAmount

      // Create invoice
      const { data: newInvoice, error: invoiceError } = (await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          client_id: invoice.client_id,
          invoice_number: invoiceNumber,
          invoice_date: new Date().toISOString(),
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          subtotal,
          discount_amount: discountAmount,
          discount_percentage: invoice.discount_type === 'percentage' ? invoice.discount_amount || 0 : 0,
          total: total,
          status: 'borrador' as const,
          notes: invoice.notes || null,
          paid_date: null,
          payment_terms: null,
          pdf_path: null,
        } as any)
        .select()
        .single()) as any

      if (invoiceError) throw invoiceError

      if (!newInvoice) throw new Error('Failed to create invoice')

      // Link activities to invoice
      const invoiceActivities = invoice.activity_ids.map((activityId) => ({
        invoice_id: newInvoice.id,
        activity_id: activityId,
      }))

      const { error: linkError } = await supabase.from('invoice_activities').insert(invoiceActivities as any)

      if (linkError) throw linkError

      // Update activities status to por_facturar
      // @ts-ignore - Supabase type system limitation
      const { error: updateError } = await supabase
        .from('activities')
        .update({ status: 'por_facturar' } as any)
        .in('id', invoice.activity_ids)

      if (updateError) throw updateError

      return newInvoice
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}

export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      // @ts-ignore - Supabase type system limitation
      const { data, error } = await supabase
        .from('invoices')
        .update({ status } as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // If marking as paid, update activities to facturada
      if (status === 'pagada') {
        const { data: invoiceActivities } = await supabase
          .from('invoice_activities')
          .select('activity_id')
          .eq('invoice_id', id)

        if (invoiceActivities) {
          // @ts-expect-error - Supabase type inference issue
          const activityIds = invoiceActivities.map((ia) => ia.activity_id)
          // @ts-expect-error - Supabase type inference issue
          await supabase.from('activities').update({ status: 'facturada' }).in('id', activityIds)
        }
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      // Delete invoice_activities first (foreign key constraint)
      const { error: linkError } = await supabase.from('invoice_activities').delete().eq('invoice_id', id)

      if (linkError) throw linkError

      const { error } = await supabase.from('invoices').delete().eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

// Get activities ready to be invoiced for a client
export const useInvoiceableActivities = (clientId: string | null) => {
  return useQuery({
    queryKey: ['activities', 'invoiceable', clientId],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      
      if (!user || !clientId) return []

      // First, get all projects for this client
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id')
        .eq('client_id', clientId)
        .eq('user_id', user.id)

      if (projectsError) throw projectsError
      if (!projects || projects.length === 0) return []

      const projectIds = (projects as any[]).map((p: any) => p.id)

      // Then get activities ready to be invoiced for those projects
      const { data, error } = await supabase
        .from('activities')
        .select('*, project:projects(name)')
        .eq('user_id', user.id)
        .in('status', ['completada', 'por_facturar']) // Include both completed and explicitly marked for invoicing
        .in('project_id', projectIds)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!clientId,
    staleTime: 0,
    refetchOnMount: 'always',
  })
}
