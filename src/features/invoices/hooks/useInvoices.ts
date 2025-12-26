import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Invoice, Database } from '@/types/database.types'

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

      // @ts-expect-error - Supabase type inference issue
      const subtotal =
        activities?.reduce((sum, act) => sum + (act.estimated_hours || 0) * (act.hourly_rate || 0), 0) || 0

      let discountAmount = 0
      if (invoice.discount_amount) {
        discountAmount =
          invoice.discount_type === 'percentage'
            ? subtotal * (invoice.discount_amount / 100)
            : invoice.discount_amount
      }

      const total = subtotal - discountAmount

      // Create invoice
      // @ts-expect-error - Supabase type inference issue
      const { data: newInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          client_id: invoice.client_id,
          invoice_number: invoiceNumber,
          subtotal,
          discount_amount: discountAmount,
          total_amount: total,
          status: 'borrador',
          notes: invoice.notes,
        } as Database['public']['Tables']['invoices']['Insert'])
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Link activities to invoice
      const invoiceActivities = invoice.activity_ids.map((activityId) => ({
        invoice_id: newInvoice.id,
        activity_id: activityId,
      }))

      // @ts-expect-error - Supabase type inference issue
      const { error: linkError } = await supabase.from('invoice_activities').insert(invoiceActivities)

      if (linkError) throw linkError

      // Update activities status to por_facturar
      // @ts-expect-error - Supabase type inference issue
      const { error: updateError } = await supabase
        .from('activities')
        .update({ status: 'por_facturar' })
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
      // @ts-expect-error - Supabase type inference issue
      const { data, error } = await supabase
        .from('invoices')
        .update({ status })
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
      
      console.log('🔧 useInvoiceableActivities - User:', user?.id)
      console.log('🔧 useInvoiceableActivities - Client ID:', clientId)
      
      if (!user || !clientId) {
        console.log('❌ No user or client ID')
        return []
      }

      // First, get all projects for this client
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id')
        .eq('client_id', clientId)
        .eq('user_id', user.id)

      console.log('🔧 Projects query result:', { projects, projectsError })

      if (projectsError) {
        console.error('❌ Projects error:', projectsError)
        throw projectsError
      }
      
      if (!projects || projects.length === 0) {
        console.log('⚠️ No projects found for this client')
        return []
      }

      // @ts-expect-error - Supabase type inference
      const projectIds = projects.map((p) => p.id)
      console.log('🔧 Project IDs:', projectIds)

      // Then get activities ready to be invoiced for those projects
      const { data, error } = await supabase
        .from('activities')
        .select('*, project:projects(name)')
        .eq('user_id', user.id)
        .in('status', ['completada', 'por_facturar']) // Include both completed and explicitly marked for invoicing
        .in('project_id', projectIds)
        .order('created_at', { ascending: false })

      console.log('🔧 Activities query result:', { data, error })

      if (error) {
        console.error('❌ Activities error:', error)
        throw error
      }
      
      console.log('✅ Returning activities:', data || [])
      return data || []
    },
    enabled: !!clientId,
    initialData: [],
  })
}
